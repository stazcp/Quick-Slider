import React, { useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Box } from '@material-ui/core'
import { SliderContext } from '../store/sliderContext'
import { Circle, CircleFill } from 'react-bootstrap-icons'

const useStyles = makeStyles((theme) => ({
  root: {
    zIndex: 10,
    marginRight: '15px',
  },
}))

const buttonProps = {
  size: '1.5rem',
  color: '#94979c',
  cursor: 'pointer',
}

export default function Dot({ id }) {
  const { sliderIndex, setSliderIndex } = useContext(SliderContext)
  const classes = useStyles()

  const handleClick = () => {
    setSliderIndex(id)
  }

  const renderDot = () => {
    if (sliderIndex === id) {
      return <CircleFill {...buttonProps} />
    } else {
      return <Circle {...buttonProps} />
    }
  }

  return (
    <Box className={classes.root} onClick={() => handleClick()}>
      {renderDot()}
    </Box>
  )
}
