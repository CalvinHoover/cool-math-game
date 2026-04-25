export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-5xl font-bold">Cool Math Game</h1>
      <p className="text-xl text-gray-600">Group 41 · CS 35L</p>
      <div className="mt-4 rounded-lg bg-green-100 p-4 text-green-800">
        next.js working !!
      </div>
      <div className="mt-2 flex gap-4 text-sm text-gray-500">
        <span>src/app/page.tsx</span>
        <span>·</span>
        <span>localhost:3000</span>
      </div>
    </main>
  )
}