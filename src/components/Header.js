import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, Container, Box } from '@material-ui/core'
import { createTheme, ThemeProvider, responsiveFontSizes } from '@material-ui/core/styles'

let theme = createTheme()
theme = responsiveFontSizes(theme)

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: '5rem',
    textAlign: 'center',
  },
  decription: {
    paddingTop: '2.5rem',
    textAlign: 'left',
  },
  head: {
    [theme.breakpoints.down('md')]: {
      fontSize: '1em',
    },
  },
}))

export default function Header() {
  const classes = useStyles()

  return (
    <Container maxWidth="md" classes={{ root: classes.root }}>
      <ThemeProvider theme={theme}>
        <Typography variant="h2">
          <Box fontWeight="fontWeightMedium">Quick Slider</Box>
        </Typography>
        <Box className={classes.decription}>
          <Typography variant="h5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis architecto neque
            illum eius error, totam mollitia reiciendis officiis quis magnam?
          </Typography>
        </Box>
      </ThemeProvider>
    </Container>
  )
}
