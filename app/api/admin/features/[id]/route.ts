import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withAdmin } from '@/lib/with-admin';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function __orig_PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params

    const { data: feature, error } = await supabase
      .from("registered_features")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, feature })
  } catch (error) {
    console.error("Error updating feature:", error)
    return NextResponse.json({ error: "Failed to update feature" }, { status: 500 })
  }
}

async function __orig_DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { error } = await supabase.from("registered_features").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting feature:", error)
    return NextResponse.json({ error: "Failed to delete feature" }, { status: 500 })
  }
}

const __orig_PATCH = withAdmin(__orig_PATCH);
export const PATCH = withAdmin(__orig_PATCH);
const __orig_DELETE = withAdmin(__orig_DELETE);
export const DELETE = withAdmin(__orig_DELETE);
/* ADMIN_GUARDED */
