import React from 'react'
import EventListener from '../EventListener'
import Footer from '../Footer'
import MainNavigation from './MainNavigation'

const Layout: React.FC = ({children}) => {
  return (
    <>
      <MainNavigation/>
      <main>{children}</main>
      <Footer/>
      <EventListener/>
    </>
  )
}

export default Layout