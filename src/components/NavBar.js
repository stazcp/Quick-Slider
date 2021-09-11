import React, { useContext } from 'react'
import { Box } from '@material-ui/core'
import Dot from './Dot'
import { makeStyles } from '@material-ui/core/styles'
import { SliderContext } from '../store/sliderContext'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
  },
}))

export default function NavBar() {
  const { sliderLength } = useContext(SliderContext)
  const classes = useStyles()
  const renderDots = () => {
    let dots = []
    for (let i = 0; i < sliderLength; i++) {
      dots.push(<Dot key={i} id={i} />)
    }

    return dots.map((dot) => dot)
  }

  return <Box className={classes.root}>{renderDots()}</Box>
}
