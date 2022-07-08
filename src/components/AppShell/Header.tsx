import { Icon } from "@iconify-icon/react";
import { Button } from "@mantine/core";
import { Text } from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type HeaderProps = {
  onHamburgerClick: () => void;
  hideSidebarBurger?: boolean;
};

export default function Header(props: HeaderProps) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div
      className={
        "z-30 h-16 flex items-center w-full fixed inset-0 z-10 bg-gray-50 shadow-md"
      }
    >
      <div
        className={
          "w-16 h-full flex justify-center items-center sm:hidden" +
          (props.hideSidebarBurger === true ? " hidden" : "")
        }
        onClick={props.onHamburgerClick}
      >
        <Icon icon="charm:menu-hamburger" className={"text-xl flex-1"} />
      </div>
      <div
        className={"h-full flex justify-center items-center cursor-pointer"}
        onClick={() => router.push("/")}
      >
        <img
          src={"/images/logos/logo.png"}
          className={
            "h-5/6 sm:hidden" +
            (props.hideSidebarBurger === true ? " pl-4" : "")
          }
        />
        <img
          src={"/images/logos/logo_text_side.png"}
          className={"h-4/6 pl-4 hidden sm:block"}
        />
      </div>
      <div
        className={
          "w-16 h-full ml-auto flex justify-center items-center sm:hidden"
        }
      >
        <Icon icon="ant-design:search-outlined" className={"text-2xl flex-1"} />
      </div>
      {!loggedIn ? (
        router.pathname !== "/auth/login" && (
          <Button
            className={"mr-5 sm:ml-auto bg-red-400"}
            color={"red"}
            onClick={() => router.push("/auth/login")}
          >
            <Text>Login</Text>
          </Button>
        )
      ) : (
        <div className={"ml-auto mr-4 flex justify-center items-center"}>
          Logged in
        </div>
      )}
    </div>
  );
}
