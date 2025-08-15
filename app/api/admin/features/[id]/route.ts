import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-client"

const supabase = createAdminClient()

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
