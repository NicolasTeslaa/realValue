import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const location = useLocation()

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <h1>RealValue</h1>
        </Link>
        <nav className="header-nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Buscar
          </Link>
          <Link 
            to="/ativos" 
            className={`nav-link ${location.pathname === '/ativos' ? 'active' : ''}`}
          >
            Ver Ativos
          </Link>
          <Link 
            to="/favorites" 
            className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`}
          >
            Favoritos
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
