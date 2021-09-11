import React, { useContext } from 'react'
import Header from './Header'
import Canvas from './Canvas'
import Container from '@material-ui/core/Container'
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import NavBar from './NavBar'
import { SliderContext } from '../store/sliderContext'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: '5rem',
    paddingBottom: '1rem',
  },
  center: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-around',
    flex: 0,
  },
  buttonStyle: {
    alignSelf: 'center',
    minWidth: '80px',
    zIndex: 10,
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  leftBtn: {
    [theme.breakpoints.down('md')]: {
      marginRight: -100,
    },
  },
  righttBtn: {
    [theme.breakpoints.down('md')]: {
      marginLeft: -100,
    },
  },
  bot: {
    paddingBottom: '5rem',
  },
}))

const buttonProps = {
  size: '5em',
  color: '#94979c',
  cursor: 'pointer',
  display: 'flex',
}

const Slider = () => {
  const { sliderIndex, setSliderIndex, sliderLength } = useContext(SliderContext)
  const classes = useStyles()

  const handleClick = (id) => {
    if (id === 'leftArrow') {
      const newIndex = sliderIndex > 0 ? sliderIndex - 1 : 0
      setSliderIndex(newIndex)
    } else {
      const newIndex = (sliderIndex + 1) % sliderLength
      setSliderIndex(newIndex)
    }
  }

  return (
    <Container maxWidth="lg" classes={{ root: classes.bot }}>
      <Header />
      <Container maxWidth="lg" classes={{ root: classes.center }} className={classes.root}>
        <ChevronLeft
          id="leftArrow"
          onClick={(event) => handleClick(event.target.id)}
          className={clsx(classes.buttonStyle, classes.leftBtn)}
          {...buttonProps}
        />
        <Canvas />
        <ChevronRight
          id="rightArrow"
          onClick={(event) => handleClick(event.target.id)}
          className={clsx(classes.buttonStyle, classes.righttBtn)}
          {...buttonProps}
        />
      </Container>
      <NavBar />
    </Container>
  )
}

export default Slider