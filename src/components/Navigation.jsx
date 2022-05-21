import {AppLink, NavigationMenu, TitleBar} from "@shopify/app-bridge/actions";
import {useAppBridge, useClientRouting, useRoutePropagation} from "@shopify/app-bridge-react";
import {useLocation, useNavigate} from "react-router-dom";
import {useCallback, useEffect, useMemo} from "react";

export const path = {
  home: '/',
  products: '/products',
  add: '/add-product',
  update: '/update-product/:id'
}
export function Navigation() {
  const app = useAppBridge();
  let location = useLocation();
  let navigate = useNavigate();
  let titleBarOption = {};

  useRoutePropagation(location);
  useClientRouting({replace: navigate});

  useEffect(() => {
    const homeLink = AppLink.create(app, {
      label: 'Home',
      destination: path.home,
    });

    const productsLink = AppLink.create(app, {
      label: 'Products',
      destination: path.products,
    });

    const addLink = AppLink.create(app, {
      label: 'Add product',
      destination: path.add,
    });

    const navigationMenu = NavigationMenu.create(app, {
      items: [homeLink, productsLink, addLink],
    });

    switch (location.pathname) {
      case path.home:
        navigationMenu.set({active:homeLink});
        titleBarOption = {title: 'Home'};
        break;
      case path.products:
        navigationMenu.set({active:productsLink});
        titleBarOption = {title: 'Products'};
        break;
      case path.add:
        navigationMenu.set({active:addLink});
        titleBarOption = {title: 'Add product'};
        break;
      default:
        navigationMenu.set({active:homeLink});
        titleBarOption = {title: 'Home'};
    }
    const titleBar = TitleBar.create(app, titleBarOption)
  }, [location])

  return null;
}