import NextHead from 'next/head'

export const Head = (props) => {
  return (
    <NextHead>
      <title>{props.title}</title>
      {props.children}
    </NextHead>
  )
}
export default Head
