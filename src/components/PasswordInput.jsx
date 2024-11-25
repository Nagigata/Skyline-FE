import { useState } from "react"

export default function PasswordInput({ text, handleChange, name, value }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input 
        value={value} 
        style={{backgroundColor: "#3C434A"}} 
        className="focus:outline-none rounded-2xl bg-gray text-gray text-sm placeholder-zinc-500 medium w-80 p-3" 
        placeholder={text} 
        onChange={handleChange} 
        name={name} 
        type={show ? 'text' : 'password'}
        required
        autoComplete="off"
      />
      <img 
        src={show ? 'assets/images/open-eye.png' : 'assets/images/close-eye.png'} 
        onClick={() => setShow(prevValue => !prevValue)} 
        className={`absolute right-3 cursor-pointer transition-opacity w-5 ${show ? "top-4" : "top-5"}`}
        alt="Toggle visibility"
      />
    </div>
  )
}
