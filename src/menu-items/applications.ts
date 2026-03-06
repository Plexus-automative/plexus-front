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
  NoteAdd,
  TruckFast,
  ClipboardTick
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
  truck: TruckFast,
  add: Add,
  link: Link1,
  fileManager: DocumentFilter,
  mail: DirectInbox,
  reference: NoteAdd,
  validation: ClipboardTick
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
      type: "collapse",
      breadcrumbs: false,
      icon: icons.invoice,
      children: [
        {
          id: "non-traite",
          title: "non-traite",
          type: "item",
          breadcrumbs: false,
          url: "/pages/commandes-emis/non-traitees",
        },
        {
          id: "traite",
          title: "traite",
          type: "item",
          breadcrumbs: false,
          url: "/pages/commandes-emis/traitees",
        },

        {
          id: "en-cours",
          title: "en-cours",
          type: "item",
          breadcrumbs: false,
          url: "/pages/commandes-emis/en-cours",
        },
      ]
    },
    {
      id: "commandes-recus",
      title: "commandes-recus",
      type: "collapse",
      breadcrumbs: false,
      icon: icons.invoice,
      children: [
        {
          id: "non-traite",
          title: "non-traite",
          type: "item",
          breadcrumbs: false,
          url: "/pages/commandes-recus/non-traitees",
        },
        {
          id: "traite",
          title: "traite",
          type: "item",
          breadcrumbs: false,
          url: "/pages/commandes-recus/traitees",
        },

        {
          id: "en-cours",
          title: "en-cours",
          type: "item",
          breadcrumbs: false,
          url: "/pages/commandes-recus/en-cours",
        },
      ]
    },
    {
      id: "validation-reception",
      title: "validation-reception",
      type: "item",
      breadcrumbs: false,
      icon: icons.validation,
      url: "/pages/validation-reception",
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
      id: "add-reference",
      title: "add-reference",
      type: "item",
      breadcrumbs: false,
      icon: icons.reference,
      url: "/pages/reference",
    },
    {
      id: "panier",
      title: "Panier",
      type: "item",
      breadcrumbs: false,
      icon: icons.ecommerce,
      url: "/panier",
    }
  ],
};

export default applications;
