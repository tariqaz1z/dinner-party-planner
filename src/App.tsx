import { HashRouter, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './store';
import { Layout } from './components/Layout';
import { CalendarPage, Cookbook, Home, Notifications, RecipePage, Search } from './pages/Simple';
import { Profile } from './pages/Profile';
import { Host } from './pages/Host';
import { DinnerPage } from './pages/Dinner';
import { Rsvp } from './pages/Rsvp';

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="recipe/:id" element={<RecipePage />} />
            <Route path="search" element={<Search />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="cookbook" element={<Cookbook />} />
            <Route path="profile" element={<Profile />} />
            <Route path="dinner/:id" element={<DinnerPage />} />
            <Route path="*" element={<Home />} />
          </Route>
          <Route path="host" element={<Host />} />
          <Route path="rsvp/:id" element={<Rsvp />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
