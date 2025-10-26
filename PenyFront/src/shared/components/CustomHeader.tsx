import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Group, 
  Avatar, 
  Text, 
  Menu, 
  UnstyledButton, 
  Loader,
  ActionIcon,
  Indicator,
  Badge,
  Divider,
  Paper,
  Box,
  TextInput
} from '@mantine/core';
import { 
  ChevronDown, 
  LogOut, 
  Settings, 
  User,
  Bell,
  Search,
  Sun
} from 'lucide-react';
import { useGlobalContext } from '../hooks/useGlobalContext';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import { useAppDispatch } from '../store/hooks';
import { logoutThunk } from '../store/thunks/authThunk';
import { getRoleLabel } from '../utils/userUtils';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { GlobalSearch } from './GlobalSearch';
import type { PrisionerListItem } from '../types/prisonerTypes';
import classes from '../styles/CustomHeader.module.css';

const routeTitles: Record<string, { title: string; description: string }> = {
  [ROUTES.HOME]: { 
    title: 'Panel Principal', 
    description: 'Vista general del centro penitenciario' 
  },
  [ROUTES.PRISONERS]: { 
    title: 'Gestión de Reclusos', 
    description: 'Administra los internos del centro penitenciario' 
  },
  [ROUTES.USERS]: { 
    title: 'Gestión de Usuarios', 
    description: 'Administra los usuarios del sistema penitenciario' 
  },
  [ROUTES.REPORTS]: { 
    title: 'Reportes y Estadísticas', 
    description: 'Genera y consulta reportes del sistema' 
  },
  [ROUTES.ACTIVITY]: { 
    title: 'Actividad Global', 
    description: 'Monitoreo completo de todas las acciones realizadas' 
  },
  [ROUTES.PROFILE]: { 
    title: 'Mi Perfil', 
    description: 'Gestiona tu información personal' 
  }
};

export function CustomHeader() {
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [searchOpened, setSearchOpened] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useGlobalContext();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Hook para atajo de teclado Ctrl+K
  useGlobalSearch(() => setSearchOpened(true));

  // 🆕 Obtener información de la página actual
  const currentPage = routeTitles[location.pathname] || {
    title: 'Sistema Penitenciario',
    description: 'Centro Penitenciario Chonchocoro'
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await dispatch(logoutThunk());
    setIsLoggingOut(false);
  };

  const handleProfile = () => {
    navigate(ROUTES.PROFILE);
    setUserMenuOpened(false);
  };

  const handleSettings = () => {
    navigate(ROUTES.PROFILE + '?tab=settings');
    setUserMenuOpened(false);
  };

  const handleSearchSelect = (item: PrisionerListItem) => {
    // TODO: Navegar al perfil del recluso seleccionado
    console.log('Recluso seleccionado:', item);
    navigate(ROUTES.PRISONER_PROFILE.replace(':id', item.prisoner.id));
  };

  return (
    <>
      <Paper className={classes.header} shadow="sm" withBorder>
        <Box className={classes.headerContent}>
          <Group justify="space-between" h="100%" wrap="nowrap">
            {/* Título dinámico de la página actual */}
            <Box className={classes.pageTitle}>
              <Text fw={600} size="lg" c="dark" lineClamp={1}>
                {currentPage.title}
              </Text>
              <Text size="sm" c="dimmed" lineClamp={1}>
                {currentPage.description}
              </Text>
            </Box>

            {/* Acciones del header */}
            <Group gap="sm" wrap="nowrap">
              {/* Buscador rápido */}

              <Box style={{ minWidth: 220, maxWidth: 260 }}>
                <Group gap={0} style={{ position: 'relative' }}>
                  <TextInput
                    ref={searchInputRef}
                    placeholder="Search"
                    size="sm"
                    leftSection={<Search size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />}
                    onClick={() => setSearchOpened(true)}
                  />
                </Group>
              </Box>

            <Indicator inline label="3" size={16} color="red" offset={7}>
              <ActionIcon 
                variant="subtle" 
                size="lg" 
                color="gray"
                className={classes.actionButton}
              >
                <Bell size={18} />
              </ActionIcon>
            </Indicator>

            <ActionIcon 
              variant="subtle" 
              size="lg" 
              color="gray"
              className={classes.actionButton}
            >
              <Sun size={18} />
            </ActionIcon>

            <Divider />
            <Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton className={classes.userButton}>
                  <Group gap="sm" wrap="nowrap">
                    <Avatar 
                      src={user?.photoUrl} 
                      alt={user?.name} 
                      radius="md" 
                      size={32}
                    >
                      {user?.name?.[0] ?? "U"}
                    </Avatar>
                    
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={500} size="sm" lineClamp={1}>
                        {user?.name || 'Usuario'}
                      </Text>
                      <Badge 
                        variant="light" 
                        size="xs" 
                        color="blue"
                        style={{ marginTop: 2 }}
                      >
                        {getRoleLabel(user?.role ?? "")}
                      </Badge>
                    </Box>

                    <ChevronDown 
                      size={14} 
                      style={{ 
                        transform: userMenuOpened ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 200ms ease'
                      }} 
                    />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>
                  <Group gap="xs" wrap="nowrap">
                    <Avatar src={user?.photoUrl} size={24} />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={500} size="sm" lineClamp={1}>
                        {user?.name}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {user?.email}
                      </Text>
                    </Box>
                  </Group>
                </Menu.Label>

                <Menu.Divider />

                <Menu.Item 
                  leftSection={<User size={16} />}
                  onClick={handleProfile}
                >
                  Mi Perfil
                </Menu.Item>

                <Menu.Item 
                  leftSection={<Settings size={16} />}
                  onClick={handleSettings}
                >
                  Configuración
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  color="red"
                  leftSection={
                    isLoggingOut ? (
                      <Loader size={16} />
                    ) : (
                      <LogOut size={16} />
                    )
                  }
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>
    </Paper>

    <GlobalSearch
      opened={searchOpened}
      onClose={() => {
        setSearchOpened(false);
        setTimeout(() => {
          searchInputRef.current?.blur();
        }, 50);
      }}
      onSelectResult={handleSearchSelect}
    />
    </>
  );
}
