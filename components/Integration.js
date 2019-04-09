function Integration (props) {
  return (
    <figure className='integration'>
      <div className='iconMat'>
        <img src={props.data.icon} alt={props.data.alt || props.data.name} />
      </div>
      <figcaption>{props.data.name}</figcaption>
      <style jsx>{`
        .integration {
          display: inline-block;
          .iconMat {
            padding: 15px;
            img {
              width: 30px;
            }
          }
          figcaption {
            text-align: center;
          }
        }
      `}</style>
    </figure>
  )
}

export default Integration
