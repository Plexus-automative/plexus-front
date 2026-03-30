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
  UserSquare,
  SearchNormal1,
  ExportCurve,
  ImportCurve,
  BoxTick,
  TaskSquare,
  AddCircle,
  Bag2
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
  article: SearchNormal1,
  profile: UserSquare,
  ecommerce: Bag2,
  truck: BoxTick,
  export: ExportCurve,
  import: ImportCurve,
  add: Add,
  link: Link1,
  fileManager: DocumentFilter,
  mail: DirectInbox,
  reference: AddCircle,
  validation: TaskSquare
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
      title: "articles-rechercher",
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
      icon: icons.export,
      children: [
        {
          id: "non-traite",
          title: "non-traite",
          type: "item",
          breadcrumbs: false,
          url: "/pages/commandes-emis/non-traitees",
        },
        {
          id: "en-cours",
          title: "en-cours",
          type: "item",
          breadcrumbs: false,
          url: "/pages/commandes-emis/en-cours",
        },
        {
          id: "traite",
          title: "traite",
          type: "item",
          breadcrumbs: false,
          url: "/pages/commandes-emis/traitees",
        }
      ]
    },
    {
      id: "commandes-recus",
      title: "commandes-recus",
      type: "collapse",
      breadcrumbs: false,
      icon: icons.import,
      children: [
        {
          id: "non-traite-recus",
          title: "non-traite",
          type: "item",
          breadcrumbs: false,
          url: "/pages/commandes-recus/non-traitees",
        },
        {
          id: "en-cours-recus",
          title: "en-cours",
          type: "item",
          breadcrumbs: false,
          url: "/pages/commandes-recus/en-cours",
        },
        {
          id: "traite-recus",
          title: "traite",
          type: "item",
          breadcrumbs: false,
          url: "/pages/commandes-recus/traitees",
        },
      ]
    },
    {
      id: "commandes-livrees",
      title: "commandes-livrees",
      type: "item",
      breadcrumbs: false,
      icon: icons.truck,
      url: "/pages/commandes-livree",
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
      id: "add-reference",
      title: "add-reference",
      type: "item",
      breadcrumbs: false,
      icon: icons.reference,
      url: "/pages/reference",
    },
    {
      id: "import-articles",
      title: "import-articles",
      type: "item",
      breadcrumbs: false,
      icon: icons.fileManager, // using DocumentFilter icon mapped in the file
      url: "/pages/import-articles",
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
