// project-imports

// assets
import {
  Add,
  DirectInbox,
  DocumentFilter,
  Link1,
  KyberNetwork,
  Messages2,
  Calendar1,
  Kanban,
  Profile2User,
  Bill,
  UserSquare,
  ShoppingBag,
  Note1,
  TruckFast
} from "@wandersonalwes/iconsax-react";

// types
import { NavItemType } from "types/menu";

// icons
const icons = {
  applications: KyberNetwork,
  chat: Messages2,
  calendar: Calendar1,
  kanban: Kanban,
  customer: Profile2User,
  invoice: Bill,
  article: Note1,
  profile: UserSquare,
  ecommerce: ShoppingBag,
  truck:TruckFast,
  add: Add,
  link: Link1,
  fileManager: DocumentFilter,
  mail: DirectInbox,
};

// ==============================|| MENU ITEMS - APPLICATIONS ||============================== //

const applications: NavItemType = {
  id: "group-applications",
  title: "applications",
  icon: icons.applications,
  type: "group",
  children: [
    {
      id: "articles",
      title: "articles",
      type: "item",
      breadcrumbs: false,
      icon: icons.article,
      url: "/pages/articles",
    },
    {
      id: "commandes-emis",
      title: "commandes-emis",
      type: "item",
      breadcrumbs: false,
      icon: icons.invoice,
      url: "/pages/commandes-emis",
    },
    {
      id: "commandes-recus",
      title: "commandes-recus",
      type: "item",
      breadcrumbs: false,
      icon: icons.invoice,
      url: "/pages/commandes-recus",
    },
    {
      id: "commandes-livrees",
      title: "commandes-livrees",
      type: "item",
      breadcrumbs: false,
      icon: icons.invoice,
      url: "/pages/commandes-livree",
    },
    {
      id: "e-commerce",
      title: "e-commerce",
      type: "collapse",
      breadcrumbs: false,
      icon: icons.ecommerce,
      url: "/apps/e-commerce/checkout",
      children: [
    {
      id: "product-list",
      title: "product-list",
      type: "item",
      breadcrumbs: false,
      url: "/apps/e-commerce/product-list",
    },
     ]
    },
  ],
};

export default applications;
