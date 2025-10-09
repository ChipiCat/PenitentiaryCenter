import { Autocomplete, Burger, Group, Menu, Avatar, Text, UnstyledButton, Loader, Drawer, Stack, NavLink, Container, Tabs } from '@mantine/core';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import cx from 'clsx';

import classes from '../styles/HeaderSearch.module.css';
import { Search } from 'lucide-react';
import { ChevronDown, LogOut, Settings, Home, Users, FileText, User, Activity, UserCog } from 'lucide-react';
import { useGlobalContext } from '../hooks/useGlobalContext';
import { useLocation, useNavigate } from 'react-router';
import { getRoleLabel } from '../utils/userUtils';
import { useAppDispatch } from '../store/hooks';
import { logoutThunk } from '../store/thunks/authThunk';
import { NAV_LINKS, ROUTES } from '../config/routes';

/**
 * Main header of the application with navigation tabs.
 * Fully responsive with mobile navigation drawer.
 * Based on Mantine HeaderTabs design.
 * 
 * @returns Tsx element representing the header component.
 */
export function CustomHeaders() {
  const [opened, { toggle, close }] = useDisclosure(false);
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

  // Iconos para cada enlace de navegación
  const getNavIcon = (path: string) => {
    switch (path) {
      case ROUTES.HOME: return <Home size={18} />;
      case ROUTES.PRISONERS: return <Users size={18} />;
      case ROUTES.REPORTS: return <FileText size={18} />;
      case ROUTES.USERS: return <UserCog size={18} />;
      case ROUTES.ACTIVITY: return <Activity size={18} />;
      case ROUTES.PROFILE: return <User size={18} />;
      default: return <Home size={18} />;
    }
  };

  // Función para navegar y cerrar drawer en móviles
  const handleNavigation = (path: string) => {
    navigation(path);
    close(); // Cerrar drawer después de navegar
  };

  // Obtener el valor activo del tab basado en la ruta actual
  const getActiveTab = () => {
    const activeLink = NAV_LINKS.find(link => link.path === location.pathname);
    return activeLink ? activeLink.label : NAV_LINKS[0].label;
  };

  // Crear los tabs items
  const tabItems = NAV_LINKS.map((link) => (
    <Tabs.Tab 
      value={link.label} 
      key={link.label}
      onClick={() => navigation(link.path)}
    >
      {link.label}
    </Tabs.Tab>
  ));

  // Enlaces de navegación para móvil
  const mobileItems = NAV_LINKS.map((link) => {
    const isActive = location.pathname === link.path;
    return (
      <NavLink
        key={link.label}
        label={link.label}
        leftSection={getNavIcon(link.path)}
        active={isActive}
        onClick={() => handleNavigation(link.path)}
        style={{
          borderRadius: '8px',
          marginBottom: '4px'
        }}
      />
    );
  });

  return (
    <>
      <div className={classes.header}>
        {/* Sección principal del header */}
        <Container className={classes.mainSection} size="xl">
          <Group justify="space-between">
            {/* Logo y título */}
            <Group>
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
              <div className='flex flex-row items-center'>
                <img src="/assets/LogoPenitenciaria.png" alt="Logo Penitenciaria" style={{ height: 28 }} />
                <div className="flex flex-col ml-3">
                  <span className="font-bold text-base hidden md:block">Centro Penitenciario</span>
                  <span className="font-bold text-sm md:hidden">Centro P.</span>
                  <span className="text-xs font-extralight text-gray-600 hidden md:block">Sistema de Gestión Interna</span>
                </div>
              </div>
            </Group>

            {/* Controles del lado derecho */}
            <Group gap="xs">
              {/* Barra de búsqueda - Visible desde tablet */}
              <Autocomplete
                className={classes.search}
                placeholder="Buscar reclusos"
                leftSection={<Search size={16} />}
                visibleFrom="md"
                style={{ width: 200 }}
              />

              {/* Botón de búsqueda para móvil */}
              <UnstyledButton 
                className="hover:!bg-gray-100 !p-2 rounded-md"
                hiddenFrom="md"
              >
                <Search size={18} className="text-gray-600" />
              </UnstyledButton>

              {/* Menú de usuario */}
              <Menu
                width={260}
                position="bottom-end"
                transitionProps={{ transition: 'pop-top-right' }}
                onClose={() => setUserMenuOpened(false)}
                onOpen={() => setUserMenuOpened(true)}
                withinPortal
              >
                <Menu.Target>
                  <UnstyledButton
                    className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                  >
                    <Group gap={7}>
                      <Avatar src={user?.photoUrl} alt={user?.name} radius="xl" size={20}>
                        {user?.name?.[0] ?? "U"}
                      </Avatar>
                      <Text fw={500} size="sm" lh={1} mr={3} className="truncate max-w-32 hidden sm:block">
                        {user?.name}
                      </Text>
                      <ChevronDown size={12} className='!text-gray-400 hidden sm:block' />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                  {/* Información del usuario para móvil */}
                  <div className="sm:hidden p-2 border-b border-gray-200 mb-2">
                    <Text fw={500} size="sm">{user?.name}</Text>
                    <Text size="xs" c="dimmed">{getRoleLabel(user?.role ?? "")}</Text>
                  </div>

                  <Menu.Label>Configuración</Menu.Label>
                  <Menu.Item 
                    leftSection={<Settings size="16" />} 
                    onClick={() => navigation(ROUTES.PROFILE)}
                  >
                    Mi Perfil
                  </Menu.Item>
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
        </Container>

        {/* Sección de tabs - Solo visible en desktop/tablet */}
        <Container size="xl">
          <Tabs
            value={getActiveTab()}
            variant="outline"
            visibleFrom="sm"
            classNames={{
              root: classes.tabs,
              list: classes.tabsList,
              tab: classes.tab,
            }}
          >
            <Tabs.List>{tabItems}</Tabs.List>
          </Tabs>
        </Container>
      </div>

      {/* Drawer para navegación móvil */}
      <Drawer
        opened={opened}
        onClose={close}
        title={
          <Group>
            <img src="/assets/LogoPenitenciaria.png" alt="Logo" style={{ height: 28 }} />
            <div>
              <Text fw={600} size="sm">Centro Penitenciario</Text>
              <Text size="xs" c="dimmed">Sistema de Gestión</Text>
            </div>
          </Group>
        }
        padding="md"
        size="280px"
      >
        <Stack gap="xs">
          {/* Información del usuario en drawer */}
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <Group>
              <Avatar src={user?.photoUrl} size={36}>
                {user?.name?.[0] ?? "U"}
              </Avatar>
              <div>
                <Text fw={500} size="sm">{user?.name}</Text>
                <Text size="xs" c="dimmed">{getRoleLabel(user?.role ?? "")}</Text>
              </div>
            </Group>
          </div>

          {/* Barra de búsqueda en drawer */}
          <Autocomplete
            placeholder="Buscar reclusos..."
            leftSection={<Search size={16} />}
            mb="md"
          />

          {/* Enlaces de navegación */}
          {mobileItems}

          {/* Botón de cerrar sesión en drawer */}
          <NavLink
            label="Cerrar sesión"
            leftSection={isLoggingOut ? <Loader size={16} /> : <LogOut size={18} />}
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              borderRadius: '8px',
              marginTop: '16px',
              color: 'var(--mantine-color-red-6)'
            }}
          />
        </Stack>
      </Drawer>
    </>
  );
}