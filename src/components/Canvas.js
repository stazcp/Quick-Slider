import img1 from '../slider-assets/img1.jpg'
import img2 from '../slider-assets/img2.jpg'
import img3 from '../slider-assets/img3.jpg'
import img4 from '../slider-assets/img4.jpg'
import img5 from '../slider-assets/img5.jpg'
import React, { useEffect, useState, useContext, useLayoutEffect } from 'react'
import { Box, Modal } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { SliderContext } from '../store/sliderContext'

function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

//custom hook to get width live
function useWindowSize() {
  const [size, setSize] = useState([0, 0])
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  return size
}

function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  )
}

export default function Canvas() {
  const [image, setImage] = useState(img1)
  const [open, setOpen] = useState(false)
  const [modalStyle] = useState(getModalStyle)
  const { imageData } = useContext(SliderContext)
  const [width] = useWindowSize()  /*height*/

  const useStyles = makeStyles((theme) => ({
    paper: {
      position: 'absolute',
      width: 'auto',
    },
    imageStyle: {
      cursor: 'pointer',
      [theme.breakpoints.down('md')]: {
        width: 800,
      },
      [theme.breakpoints.down('sm')]: {
        width: 600,
      },
      [theme.breakpoints.down('xs')]: {
        width: width,
      },
    },
  }))
  const classes = useStyles()

  useEffect(() => {
    setImage(selectImage(imageData))
    console.log(getWidth())
  }, [imageData])

  const selectImage = (imageData) => {
    switch (imageData.id) {
      case 2:
        return img2
      case 3:
        return img3
      case 4:
        return img4
      case 5:
        return img5
      default:
        return img1
    }
  }

  const handleClose = () => setOpen(false)

  const imageComponent = (
    <img
      src={image}
      alt={imageData.alt}
      id={imageData.image}
      onClick={() => setOpen((open) => !open)}
      className={classes.imageStyle}
    />
  )

  return (
    <Box>
      {imageComponent}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div style={modalStyle} className={classes.paper}>
          {imageComponent}
        </div>
      </Modal>
    </Box>
  )
}
