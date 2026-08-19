import { pusherServer } from '../../../lib/pusher-server';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { channel, event, data } = await req.json();
        await pusherServer.trigger(channel, event, data);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}