import {ReactNode} from 'react'
import classes from './section.module.scss'

export const Header = ({children}: {children: ReactNode}) => <h3 className={classes.header}>{children}</h3>

export const Body = ({children}: {children: ReactNode}) => <div className={classes.body}>{children}</div>

export const Root = ({children}: {children: ReactNode}) => (
  <section className={classes.root}>{children}</section>
)
