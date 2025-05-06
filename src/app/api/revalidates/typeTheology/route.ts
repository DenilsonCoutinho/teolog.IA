import { db as prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { redirect } from 'next/navigation';

export async function GET(req: NextRequest) {
    const session = await auth()
    try {

        if (!session?.user.id) {
            return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        const data = await prisma.typetheology.findFirst({
            where: { userId: session?.user.id },
            select: { type_theology: true }
        })

        return new Response(JSON.stringify({ data }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

}
