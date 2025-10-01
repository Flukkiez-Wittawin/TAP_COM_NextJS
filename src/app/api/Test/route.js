// app/api/users/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Handle GET request
  return NextResponse.json({ message: 'List of usersX' });
}

export async function POST(request) {
  // Handle POST request
  const body = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ];
  return NextResponse.json({ message: 'User created', data: body });
}