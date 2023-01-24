import { Tooltip } from "@mui/material";
import { useStarknetCall } from "@starknet-react/core";
import { useRouter } from "next/router";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useStarknetIdContract } from "../../../../hooks/contracts";
import { stringToHex } from "../../../../utils/felt";
import TwitterIcon from "../../../UI/iconsComponents/icons/twitterIcon";
import styles from "../../../../styles/components/icons.module.css";

type ClickableTwitterIconProps = {
  color: string;
  width: string;
  tokenId: string;
  isOwner: boolean;
};

const ClickableTwitterIcon: FunctionComponent<ClickableTwitterIconProps> = ({
  width,
  color,
  tokenId,
  isOwner,
}) => {
  const router = useRouter();
  const { contract } = useStarknetIdContract();
  const { data, error } = useStarknetCall({
    contract: contract,
    method: "get_verifier_data",
    args: [
      router.query.tokenId,
      stringToHex("twitter"),
      process.env.NEXT_PUBLIC_VERIFIER_CONTRACT as string,
    ],
  });
  const [twitterId, setTwitterId] = useState<string | undefined>();
  const [twitterUsername, setTwitterUsername] = useState<string | undefined>();

  useEffect(() => {
    if (error || !data || Number(data) === 0) return;
    setTwitterId(data["data"].toString(10));
  }, [data, error]);

  function startVerification(link: string): void {
    sessionStorage.setItem("tokenId", tokenId);
    router.push(link);
  }

  useEffect(() => {
    if (twitterId) {
      fetch(`/api/twitter/get_username?id=${twitterId}`)
        .then((response) => response.json())
        // TO DO : Find how to import the twitter response type
        .then((data) => {
          setTwitterUsername(data[0].username);
        });
    }
  }, [twitterId]);

  return isOwner ? (
    <Tooltip title={"Start twitter verification"} arrow>
      <div
        className={styles.clickableIcon}
        onClick={() =>
          startVerification(
            `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=Rkp6QlJxQzUzbTZtRVljY2paS0k6MTpjaQ&redirect_uri=${process.env.NEXT_PUBLIC_APP_LINK}/twitter&scope=users.read%20tweet.read&state=state&code_challenge=challenge&code_challenge_method=plain`
          )
        }
      >
        <TwitterIcon width={width} color={color} />
      </div>
    </Tooltip>
  ) : twitterUsername ? (
    <Tooltip
      title="A twitter account is linked to your identity, click to change it"
      arrow
    >
      <div
        className="cursor-pointer"
        onClick={() =>
          startVerification(
            `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=Rkp6QlJxQzUzbTZtRVljY2paS0k6MTpjaQ&redirect_uri=${process.env.NEXT_PUBLIC_APP_LINK}/twitter&scope=users.read%20tweet.read&state=state&code_challenge=challenge&code_challenge_method=plain`
          )
        }
      >
        <TwitterIcon width={width} color={"#1DA1F2"} />
      </div>
    </Tooltip>
  ) : null;
};

export default ClickableTwitterIcon;
