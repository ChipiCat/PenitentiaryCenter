import { Autocomplete, Burger, Group, Menu, Avatar, Text, UnstyledButton, Loader } from '@mantine/core';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';

import classes from '../styles/HeaderSearch.module.css';
import { ChevronUp, Search } from 'lucide-react';
import { ChevronDown, LogOut, Settings, Repeat } from 'lucide-react';
import { useGlobalContext } from '../hooks/useGlobalContext';
import { useLocation, useNavigate } from 'react-router';
import { getRoleLabel } from '../utils/userUtils';
import { useAppDispatch } from '../store/hooks';
import { logoutThunk } from '../store/thunks/authThunk';

const links = [
  { link: '/home', label: 'Panel principal' },
  { link: '/prisoners', label: 'Reclusos' },
  { link: '/reports', label: 'Reportes' },
];
/**
 * Main header of the application with navigation links and search bar.
 * 
 * @returns Tsx element representing the header component.
 */
export function CustomHeaders() {

  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const { user } = useGlobalContext();
  const location = useLocation();
  const navigation = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await dispatch(logoutThunk());
    setIsLoggingOut(false);
  };


  const items = links.map((link) => {
    const isActive = (location.pathname === '/home' && link.label === 'Features') ||
      (location.pathname === link.link);
    return (
      <a
        key={link.label}
        href={link.link}
        className={`${classes.link} !rounded-md transition-colors duration-200 ${isActive ? '!bg-black !text-white' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          navigation(link.link);
        }}
      >
        {link.label}
      </a>
    );
  });

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group justify="space-between" align="center" style={{ width: '100%' }}>
          <Group>
            <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
            <div className='flex flex-row items-center'>
              <img src="/assets/LogoPenitenciaria.png" alt="Logo Policia" style={{ height: 54 }} />
              <div className="flex flex-col ml-3">
                <span className="font-bold text-lg">Centro Penitenciario</span>
                <span className="text-sm font-extralight text-gray-600">Sistema de Gestión Interna</span>
              </div>
            </div>
          </Group>

          <Group>
            <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
              {items}
            </Group>
            <Autocomplete
              className={classes.search}
              placeholder="Busqueda de reclusos"
              leftSection={<Search size={16} />}
              visibleFrom="xs"
            />

            <Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton className={`hover:!bg-gray-100 !px-2 !py-1 rounded-md ${userMenuOpened ? '!bg-gray-100' : ''}`}>
                  <Group gap={7}>
                    <Avatar src={user?.photoUrl} alt={user?.name} radius="xl" size={32}>
                      {user?.name?.[0] ?? "U"}
                    </Avatar>
                    <div className='flex flex-col'>
                      <Text fw={500} size="sm" lh={1} mr={3}>{user?.name}</Text>
                      <span className="text-sm font-extralight text-gray-600">{getRoleLabel(user?.role ?? "")}</span>
                    </div>
                    {userMenuOpened ? <ChevronUp size="18" className='!text-gray-400' /> : <ChevronDown size="18" className='!text-gray-400' />}
                    </Group>

                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>


                <Menu.Label>Configuración</Menu.Label>
                <Menu.Item leftSection={<Settings size="16" />}>Configuración de la cuenta</Menu.Item>
                <Menu.Item leftSection={<Repeat size="16" />}>Cambiar cuenta</Menu.Item>
                <Menu.Item
                  leftSection={isLoggingOut ? <Loader size={16} /> : <LogOut size="16" />}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  Cerrar sesión
                </Menu.Item>


              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </div>
    </header>
  );
}