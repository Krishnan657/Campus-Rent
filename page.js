'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function RentingWebsite() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddProduct, setShowAddProduct] = useState(false)

  useEffect(() => {
    fetchProducts()
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  async function fetchProducts() {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  function addToCart(product) {
    if (!cart.some(item => item.id === product._id)) {
      setCart([...cart, { id: product._id, name: product.name, price: product.price }])
      alert(`${product.name} has been added to your cart!`)
    } else {
      alert("This product is already in your cart!")
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    const form = event.target
    const email = form.email.value
    const password = form.password.value

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        setIsLoggedIn(true)
        setShowLogin(false)
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error during login:', error)
    }
  }

  async function handleRegister(event) {
    event.preventDefault()
    const form = event.target
    const username = form.username.value
    const email = form.email.value
    const password = form.password.value

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        setShowRegister(false)
        setShowLogin(true)
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error during registration:', error)
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch('/api/logout')
      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        setIsLoggedIn(false)
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  async function handleAddProduct(event) {
    event.preventDefault()
    const form = event.target
    const name = form.name.value
    const description = form.description.value
    const price = parseFloat(form.price.value)
    const image = form.image.value

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price, image }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Product added successfully!')
        setShowAddProduct(false)
        fetchProducts() // Refresh the product list
      } else {
        alert(data.message || 'Error adding product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Error adding product')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-600">CampusRent</h1>
          <nav className="mt-4 w-full md:mt-0 md:w-auto">
            <ul className="flex flex-wrap justify-center space-x-2 md:space-x-4">
              <li><Button variant="ghost">Home</Button></li>
              <li><Button variant="ghost">Products</Button></li>
              <li><Button variant="ghost">Cart ({cart.length})</Button></li>
              {!isLoggedIn ? (
                <>
                  <li><Button variant="outline" onClick={() => setShowLogin(true)}>Login</Button></li>
                  <li><Button variant="outline" onClick={() => setShowRegister(true)}>Register</Button></li>
                </>
              ) : (
                <>
                  <li><Button variant="outline" onClick={() => setShowAddProduct(true)}>Add Product</Button></li>
                  <li><Button variant="outline" onClick={handleLogout}>Logout</Button></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <Card key={product._id} className="flex flex-col h-full transition-transform duration-300 hover:scale-105">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img src={product.image} alt={product.name} className="object-cover rounded-md" />
                </div>
                <p className="text-gray-600 mb-2">{product.description}</p>
                <p className="font-bold text-lg text-blue-600">${product.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => addToCart(product)} className="w-full">Add to Cart</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Register</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">Register</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" required />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" name="image" type="url" required />
            </div>
            <Button type="submit" className="w-full">Add Product</Button>
          </form>
        </DialogContent>
      </Dialog>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 CampusRent. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-4">
            <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

