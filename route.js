import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const products = await db.collection('products').find({}).toArray()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { db } = await connectToDatabase()
    const { name, description, price, image } = await request.json()

    if (!name || !description || !price || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await db.collection('products').insertOne({
      name,
      description,
      price: parseFloat(price),
      image
    })

    return NextResponse.json({ message: 'Product added successfully', productId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('Error adding product:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

