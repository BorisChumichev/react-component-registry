var components = require('./_components/index.js')
//React.render(components[0].example(), document.body)
React.render(
  <div>
    {components.map(function (c) {
      return c.example()
    })}
  </div>
  , document.body)
