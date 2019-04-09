export default function Store ({ providers, children }) {
  return providers.reduce((prev, [Context, value]) => {
    return (
      <Context.Provider value={value}>
        {prev}
      </Context.Provider>
    )
  }, children)
}
