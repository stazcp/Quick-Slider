import React, { createContext, useState, useEffect } from 'react'
import { SliderData } from '../slider-assets/SliderData'
export const SliderContext = createContext()

export default function SliderProvider(props) {
  const [sliderIndex, setSliderIndex] = useState(0)
  const [imageData, setImageData] = useState(SliderData[sliderIndex])
  const sliderLength = SliderData.length

  useEffect(() => {
    setImageData(SliderData[sliderIndex])
  }, [sliderIndex])

  return (
    <SliderContext.Provider
      value={{ sliderIndex, setSliderIndex, imageData, setImageData, sliderLength, SliderData }}
    >
      {props.children}
    </SliderContext.Provider>
  )
}
