import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  </div>
);

export default Layout;
