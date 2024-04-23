import { SearchBox } from '@/components/component/search-box'

export default async function Home() {
  //bg-gradient-to-l from-gray-700 to-grey-700

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-8 bg-gray-700">
      <div className='w-2/4 bg-gradient-to-r from-gray-800 to-zinc-900 p-6 shadow-md rounded-lg mx-auto my-8 "'>
        <SearchBox />
      </div>
    </main>
  )
}
