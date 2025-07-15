import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client with service role key
const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
import { 
  createApiErrorResponse, 
  createApiSuccessResponse, 
  createDatabaseError,
  createValidationError,
  createAuthError,
  withRetry
} from '@/lib/utils/error-handler'
import { ErrorCode, ValidationError } from '@/lib/types/errors'

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient()
    
    if (!adminSupabase) {
      return createApiErrorResponse(
        createAuthError('Admin access required'),
        request
      )
    }

    const result = await withRetry(async () => {
      const { data, error } = await adminSupabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        throw createDatabaseError('fetch categories', error)
      }

      return data || []
    })

    return createApiSuccessResponse(result, {
      message: 'Categories retrieved successfully'
    })
  } catch (error) {
    return createApiErrorResponse(error, request)
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient()
    
    if (!adminSupabase) {
      return createApiErrorResponse(
        createAuthError('Admin access required'),
        request
      )
    }

    const body = await request.json()
    const { action, ...data } = body
    
    // Validate required fields
    const validationErrors: ValidationError[] = []
    
    if (!action) {
      validationErrors.push({
        field: 'action',
        message: 'Action is required',
        constraint: 'required'
      })
    }
    
    if (validationErrors.length > 0) {
      return createApiErrorResponse(
        createValidationError(validationErrors),
        request
      )
    }
    
    switch (action) {
      case 'create':
        return await handleCreateCategory(adminSupabase, data, request)
      case 'update':
        return await handleUpdateCategory(adminSupabase, data, request)
      case 'delete':
        return await handleDeleteCategory(adminSupabase, data, request)
      default:
        return createApiErrorResponse(
          createValidationError([{
            field: 'action',
            message: 'Invalid action. Must be create, update, or delete',
            value: action,
            constraint: 'enum'
          }]),
          request
        )
    }
  } catch (error) {
    return createApiErrorResponse(error, request)
  }
}

async function handleCreateCategory(
  adminSupabase: any,
  data: any,
  request: NextRequest
) {
  const validationErrors: ValidationError[] = []
  
  if (!data.name) {
    validationErrors.push({
      field: 'name',
      message: 'Category name is required',
      constraint: 'required'
    })
  }
  
  if (validationErrors.length > 0) {
    return createApiErrorResponse(
      createValidationError(validationErrors),
      request
    )
  }

  const result = await withRetry(async () => {
    const { data: newCategory, error: createError } = await adminSupabase
      .from('categories')
      .insert({
        name: data.name,
        description: data.description || null,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      if (createError.code === '23505') { // Unique constraint violation
        throw createValidationError([{
          field: 'name',
          message: 'A category with this name already exists',
          value: data.name,
          constraint: 'unique'
        }])
      }
      throw createDatabaseError('create category', createError)
    }

    return newCategory
  })

  return createApiSuccessResponse(result, {
    message: 'Category created successfully'
  })
}

async function handleUpdateCategory(
  adminSupabase: any,
  data: any,
  request: NextRequest
) {
  const validationErrors: ValidationError[] = []
  
  if (!data.id) {
    validationErrors.push({
      field: 'id',
      message: 'Category ID is required',
      constraint: 'required'
    })
  }
  
  if (!data.name) {
    validationErrors.push({
      field: 'name',
      message: 'Category name is required',
      constraint: 'required'
    })
  }
  
  if (validationErrors.length > 0) {
    return createApiErrorResponse(
      createValidationError(validationErrors),
      request
    )
  }

  const result = await withRetry(async () => {
    const { data: updatedCategory, error: updateError } = await adminSupabase
      .from('categories')
      .update({
        name: data.name,
        description: data.description || null,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === '23505') { // Unique constraint violation
        throw createValidationError([{
          field: 'name',
          message: 'A category with this name already exists',
          value: data.name,
          constraint: 'unique'
        }])
      }
      if (updateError.code === 'PGRST116') { // No rows returned
        throw createValidationError([{
          field: 'id',
          message: 'Category not found',
          value: data.id,
          constraint: 'exists'
        }])
      }
      throw createDatabaseError('update category', updateError)
    }

    return updatedCategory
  })

  return createApiSuccessResponse(result, {
    message: 'Category updated successfully'
  })
}

async function handleDeleteCategory(
  adminSupabase: any,
  data: any,
  request: NextRequest
) {
  const validationErrors: ValidationError[] = []
  
  if (!data.id) {
    validationErrors.push({
      field: 'id',
      message: 'Category ID is required',
      constraint: 'required'
    })
  }
  
  if (validationErrors.length > 0) {
    return createApiErrorResponse(
      createValidationError(validationErrors),
      request
    )
  }

  const result = await withRetry(async () => {
    // Check if category has associated projects
    const { data: projectCount, error: countError } = await adminSupabase
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('category_id', data.id)

    if (countError) {
      throw createDatabaseError('check category usage', countError)
    }

    if (projectCount && projectCount.length > 0) {
      throw createValidationError([{
        field: 'id',
        message: 'Cannot delete category with associated projects',
        value: data.id,
        constraint: 'foreign_key'
      }])
    }

    const { error: deleteError } = await adminSupabase
      .from('categories')
      .delete()
      .eq('id', data.id)

    if (deleteError) {
      if (deleteError.code === 'PGRST116') { // No rows returned
        throw createValidationError([{
          field: 'id',
          message: 'Category not found',
          value: data.id,
          constraint: 'exists'
        }])
      }
      throw createDatabaseError('delete category', deleteError)
    }

    return { id: data.id }
  })

  return createApiSuccessResponse(result, {
    message: 'Category deleted successfully'
  })
} 