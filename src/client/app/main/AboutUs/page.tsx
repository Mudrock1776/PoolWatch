'use client';

import { useState } from 'react';
import TopMenu from '../ui/TopMenu';
import Sidebar from '../ui/Sidebar';

export default function ContactsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contacts = [
    { id: 1, name: 'Dylan Hughes', role: 'CpE', },
    { id: 2, name: 'Ning Dim', role: 'CpE', },
    { id: 3, name: 'Austin Naugle', role: 'PsE', },
    { id: 4, name: 'Jason Ser', role: 'PsE', },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar open={sidebarOpen} />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <TopMenu onToggleSidebar={() => setSidebarOpen(prev=> !prev)} />
        <section className="px-5 py-6 md:px-8 md:py-8">
          <h1 className="text-2xl md:text-3xl text-white text-center font-bold">Team Members</h1>
          <p className="text-white text-center mt-2">Group 4</p>
        </section>
        <section className="px-5 pb-10 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {contacts.map((contact) => (
              <article
                key={contact.id}
                className="bg-white rounded-lg shadow p-5 flex flex-col gap-4"
              >
                <div className="w-full h-40 rounded-md bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">Picture</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg text-center font-semibold">{contact.name}</h2>
                  <p className="text-sm text-center text-gray-600">{contact.role}</p>
                </div>
                <div className="pt-2 border-t">
                  <a
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
