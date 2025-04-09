import * as React from "react";
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";
// Re-export the Toaster component with CBRE styling
export function CBREToaster() {
    return (<SonnerToaster theme="light" className="font-calibre" toastOptions={{
            classNames: {
                toast: "bg-white border-light-grey",
                title: "text-dark-grey font-semibold",
                description: "text-dark-grey",
                actionButton: "bg-cbre-green text-white hover:bg-cbre-green/90",
                cancelButton: "bg-muted text-muted-foreground hover:bg-muted/90",
                error: "bg-destructive/15 border-destructive text-destructive",
                success: "bg-accent-green/15 border-accent-green text-cbre-green",
            },
        }}/>);
}
// Helper function to show toasts with CBRE styling
export function toast({ title, description, variant = "default", action, duration = 5000, }) {
    return sonnerToast(title || description, Object.assign(Object.assign(Object.assign({ description: title ? description : undefined, duration }, (variant === "success" && { success: true })), (variant === "error" && { error: true })), (action && {
        action: {
            label: action.label,
            onClick: action.onClick,
        },
    })));
}
// Export the useToast hook for direct access to sonner's functionality
export { useToast } from "sonner";
//# sourceMappingURL=cbre-toast.jsx.map