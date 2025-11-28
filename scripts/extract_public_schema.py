import re
import os

def extract_public_schema(input_file, output_file):
    print(f"Extracting public schema from {input_file} to {output_file}...")
    
    with open(input_file, 'r') as f:
        lines = f.readlines()

    output = []
    
    # Add extensions setup
    output.append("-- Enable extensions\n")
    output.append("CREATE SCHEMA IF NOT EXISTS extensions;\n")
    output.append("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\" WITH SCHEMA extensions;\n")
    output.append("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\" WITH SCHEMA extensions;\n")
    output.append("\n")

    current_block = []
    in_public_block = False
    in_copy_block = False
    in_function_body = False
    function_delimiter = None
    
    # Regex patterns
    public_start_pattern = re.compile(r'^(CREATE|ALTER|DROP|COMMENT) .+( |")public\.')
    copy_pattern = re.compile(r'^COPY public\.')
    setval_pattern = re.compile(r"^SELECT pg_catalog\.setval\('public\.")
    grant_pattern = re.compile(r'^(GRANT|REVOKE) .+ ON .+( |")public\.')
    
    # FK to auth.users pattern
    auth_ref_pattern = re.compile(r'REFERENCES auth\.users')

    i = 0
    while i < len(lines):
        line = lines[i]
        
        if not in_public_block:
            is_start = (public_start_pattern.match(line) or 
                        copy_pattern.match(line) or 
                        setval_pattern.match(line) or
                        grant_pattern.match(line))
            
            if is_start:
                in_public_block = True
                current_block = []
                
                if copy_pattern.match(line):
                    in_copy_block = True
                elif "FUNCTION" in line:
                     if "$$" in line: 
                         in_function_body = True
                         function_delimiter = "$$"
                     elif "$_$" in line:
                         in_function_body = True
                         function_delimiter = "$_$"
                     # If no delimiter on this line, it might be on next line, handle in loop
            else:
                i += 1
                continue
        
        # We are in a block (or just started)
        current_block.append(line)
        
        # Check for end
        if in_copy_block:
            if line.strip() == '\.':
                in_copy_block = False
                in_public_block = False
                output.extend(current_block)
                current_block = []
        elif in_function_body:
            if function_delimiter and line.strip().endswith(function_delimiter + ";"):
                in_function_body = False
                function_delimiter = None
                in_public_block = False
                output.extend(current_block)
                current_block = []
        else:
            # Check if function body starts on this line (if not caught above)
            if "FUNCTION" in current_block[0] and not in_function_body:
                 if "$$" in line: 
                     in_function_body = True
                     function_delimiter = "$$"
                 elif "$_$" in line:
                     in_function_body = True
                     function_delimiter = "$_$"
            
            # Check for end of statement
            # Be careful: "CREATE FUNCTION ... AS $$" ends with $$ but statement continues until $$;
            # If in_function_body is True, we won't hit this else.
            
            if not in_function_body and line.strip().endswith(';'):
                # End of statement
                block_content = "".join(current_block)
                if not auth_ref_pattern.search(block_content):
                    output.extend(current_block)
                else:
                    print(f"Skipping constraint referencing auth.users in block starting with: {current_block[0].strip()}")
                    output.append(f"-- Skipped constraint referencing auth.users\n")
                
                in_public_block = False
                current_block = []
        
        i += 1

    with open(output_file, 'w') as f:
        f.writelines(output)
    
    print("Extraction complete.")

if __name__ == "__main__":
    # Ensure directory exists
    os.makedirs('supabase/backups', exist_ok=True)
    extract_public_schema('supabase/backups/backup.sql', 'supabase/backups/public_schema.sql')
