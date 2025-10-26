import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Text, ActionIcon, Tooltip } from '@mantine/core';
import { 
  Home, 
  Users, 
  FileText, 
  Activity, 
  UserCog,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ROUTES } from '../config/routes';
import classes from '../styles/NavbarSimple.module.css';

// Datos de navegación
const navigationData = [
  { link: ROUTES.HOME, label: 'Panel Principal', icon: Home },
  { link: ROUTES.PRISONERS, label: 'Reclusos', icon: Users },
  { link: ROUTES.ACTIVITY, label: 'Actividades', icon: Activity },
  { link: ROUTES.USERS, label: 'Usuarios', icon: UserCog },
];

export function NavbarSimple() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (link: string) => {
    navigate(link);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // 🆕 Actualizar CSS variable cuando cambie el estado
  useEffect(() => {
    const width = collapsed ? 70 : 260;
    document.documentElement.style.setProperty('--navbar-width', `${width}px`);
  }, [collapsed]);

  // Crear los enlaces de navegación
  const links = navigationData.map((item) => {
    const isActive = location.pathname === item.link;
    
    return collapsed ? (
      // Versión colapsada - solo tooltip
      <Tooltip 
        key={item.label}
        label={item.label}
        position="right"
        offset={10}
        withArrow
      >
        <a
          className={`${classes.link} ${classes.linkCollapsed}`}
          data-active={isActive || undefined}
          href={item.link}
          onClick={(event) => {
            event.preventDefault();
            handleNavigation(item.link);
          }}
        >
          <item.icon className={classes.linkIcon} size={20} />
        </a>
      </Tooltip>
    ) : (
      // Versión expandida - normal
      <a
        key={item.label}
        className={classes.link}
        data-active={isActive || undefined}
        href={item.link}
        onClick={(event) => {
          event.preventDefault();
          handleNavigation(item.link);
        }}
      >
        <item.icon className={classes.linkIcon} size={20} />
        <span className={classes.linkText}>{item.label}</span>
      </a>
    );
  });

  return (
    <nav className={`${classes.navbar} ${collapsed ? classes.navbarCollapsed : ''}`}>
      {/* Header del navbar con logo */}
      <div className={classes.header}>
        <div className={classes.logoSection}>
          <img 
            src="/assets/LogoPenitenciaria.png" 
            alt="Logo Penitenciaria" 
            className={classes.logo}
          />
          {!collapsed && (
            <div className={classes.logoText}>
              <Text fw={700} size="sm" c="blue">Centro Penitenciario</Text>
              <Text size="xs" c="dimmed">Chonchocoro</Text>
            </div>
          )}
        </div>
      </div>

      {/* Enlaces de navegación */}
      <div className={classes.linksSection}>
        {links}
      </div>

      {/* Footer con botón de colapso */}
      <div className={classes.footer}>
        <div className={classes.collapseSection}>
          <ActionIcon
            variant="light"
            color="gray"
            size="md"
            onClick={toggleCollapse}
            className={classes.collapseButton}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </ActionIcon>
        </div>
      </div>
    </nav>
  );
}
