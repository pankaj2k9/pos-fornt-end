import React from 'react'

const NotFound = (props) => {
  return (
    <div className='container'>

      <h1>404</h1>
      <p><strong>File not found</strong></p>

      <p>
        The site configured at this address does not
        contain the requested file.
      </p>

      <p>
        If this is your site, make sure that the filename case matches the URL.<br />
        For root URLs (like <code>http://example.com/</code>) you must provide an
        <code>index.html</code> file.
      </p>

      <p>
        <a href='https://help.github.com/pages/'>Read the full documentation</a>
        for more information about using <strong>GitHub Pages</strong>.
      </p>

      <div id='suggestions'>
        <a href='https://status.github.com'>GitHub Status</a>
        <a href='https://twitter.com/githubstatus'>@githubstatus</a>
      </div>
    </div>
  )
}

export default NotFound
