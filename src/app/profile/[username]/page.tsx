import React from 'react'

function page({params}:{params:{username:string}}) {
    console.log(params);
  return (
    <div>page1</div>
  )
}

export default page