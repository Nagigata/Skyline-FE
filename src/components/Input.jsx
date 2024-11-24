export default function Input({ text, handleChange, name, value }) {
  return (
    <input
      value={value}
      style={{ backgroundColor: "#3C434A" }}
      autoComplete="off"
      className="focus:outline-none rounded-2xl bg-gray text-gray text-sm placeholder-zinc-500 medium w-80 p-3"
      placeholder={text}
      onChange={handleChange}
      name={name}
      required
    />
  );
}
