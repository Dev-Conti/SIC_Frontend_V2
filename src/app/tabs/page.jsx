"use client";

import {
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
} from "@material-tailwind/react";
import { useState } from "react";

// Configuração de abas com componentes dinâmicos
const tabConfig = [
    {
        label: "Informações Pessoais",
        value: "personal",
        component: () => (
            <form>
                <div>
                    <label htmlFor="name">Nome:</label>
                    <input type="text" id="name" name="name" />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" />
                </div>
            </form>
        ),
    },
    {
        label: "Endereço",
        value: "address",
        component: () => (
            <form>
                <div>
                    <label htmlFor="street">Rua:</label>
                    <input type="text" id="street" name="street" />
                </div>
                <div>
                    <label htmlFor="city">Cidade:</label>
                    <input type="text" id="city" name="city" />
                </div>
            </form>
        ),
    },
    {
        label: "Configurações",
        value: "settings",
        component: () => (
            <form>
                <div>
                    <label htmlFor="notifications">Notificações:</label>
                    <input type="checkbox" id="notifications" name="notifications" />
                </div>
                <div>
                    <label htmlFor="theme">Tema:</label>
                    <select id="theme" name="theme">
                        <option value="light">Claro</option>
                        <option value="dark">Escuro</option>
                    </select>
                </div>
            </form>
        ),
    },
];

export default function FormTabs() {
    const [activeTab, setActiveTab] = useState("personal");

    return (
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
            <TabsHeader>
                {tabConfig.map(({ label, value }) => (
                    <Tab key={value} value={value}>
                        {label}
                    </Tab>
                ))}
            </TabsHeader>
            <TabsBody>
                {tabConfig.map(({ value, component: Component }) => (
                    <TabPanel key={value} value={value}>
                        <Component />
                    </TabPanel>
                ))}
            </TabsBody>
        </Tabs>
    );
}
