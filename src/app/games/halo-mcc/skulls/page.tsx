"use client";

import dynamic from "next/dynamic";

const ClientOnly = dynamic(() => import("@/games/halo-mcc/skulls"), { ssr: false });

const SkullsPage = () => <ClientOnly />;

export default SkullsPage;
