import React from 'react'
import { BrowserRouter, Link, Route } from '@practice/react-router'

export default function App() {
  const Nav = () => {
    return (
      <nav>
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/list">List</Link>
        </li>

        <li>
          <Link to="/about">About</Link>
        </li>
      </nav>
    )
  }

  const Home = () => (
    <div>This is home</div>
  )

  const List = () => {
    return (
      <div>
        <div>List 1</div>
        <div>List 2</div>
        <div>List 3</div>
      </div>
    )
  }

  const About = () => (
    <div>about this package.just some router implements</div>
  )

  return (
    <BrowserRouter>
      <h1>@practice/react-router implementation</h1>
      <Nav />

      <br />

      <Route to={'/'} element={<Home />} />
      <Route to={'/list'} element={<List />} />
      <Route to={'/about'} element={<About />} />
    </BrowserRouter>
  )
}