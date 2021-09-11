import Slider from './components/Slider'
import React from 'react'
import SliderProvider from './store/sliderContext'

function App() {
  return (
    <SliderProvider>
      <Slider />
    </SliderProvider>
  )
}

export default App
