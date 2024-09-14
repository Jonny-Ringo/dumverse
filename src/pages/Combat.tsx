import ImgButton from "@/components/ui/imgButton";
import { ITEM_ICONS, ENEMY_CARD_IMAGE, IMAGES, SOUNDS } from "@/lib/constants";
import { getEquippedItem } from "@/lib/utils";
import { useCombatStore } from "@/store/useCombatStore";
import { GameStatePages, useGameStore } from "@/store/useGameStore";
import { Battle, NPC } from "@/types/combat";
import { useEffect, useRef } from "react";

// const currentBattle = {
//   log: [
//     {
//       timestamp: 1726346958193,
//       message: "hits Doe Eyed Deer for 2",
//       from: "3",
//     },
//     {
//       timestamp: 1726346958193,
//       message: "has slain Doe Eyed Deer",
//       from: "3",
//     },
//     {
//       timestamp: 1726346958193,
//       message: "hits CryptoCherie for 1",
//       from: "NPC_2",
//     },
//     {
//       timestamp: 1726346961590,
//       message: "hits Sad Hedgehog for 2",
//       from: "3",
//     },
//     {
//       timestamp: 1726346961590,
//       message: "has slain Sad Hedgehog",
//       from: "3",
//     },
//     {
//       timestamp: 1726346961590,
//       message: "has won the battle",
//       from: "3",
//     },
//   ],
//   winner: "2",
//   npcs: {
//     NPC_1: {
//       health: 0,
//       dumz_reward: 1,
//       damage: 1,
//       difficulty: "EASY",
//       total_health: 1,
//       gold_reward: 10,
//       extra_gold: 10000,
//       id: "NPC_1",
//       defense: 0,
//       name: "Doe Eyed Deer",
//     },
//     NPC_2: {
//       health: 0,
//       dumz_reward: 1,
//       damage: 1,
//       difficulty: "EASY",
//       total_health: 1,
//       gold_reward: 10,
//       extra_gold: 0,
//       id: "NPC_2",
//       defense: 0,
//       name: "Sad Hedgehog",
//     },
//   },
//   npcs_alive: [],
//   last_npc_attack_timestamp: {
//     NPC_1: 1726346952043,
//     NPC_2: 1726346958193,
//   },
//   level: 1,
//   id: 39,
//   players_attacked: ["2"],
//   ended: true,
//   created_at: 1726346952043,
//   players: {
//     "2": {
//       potion: {
//         health: 1,
//         id: 12,
//         item_id: "POTION_1",
//       },
//       name: "CryptoCherie",
//       damage: 2,
//       health: 2,
//       potion_used: true,
//       total_health: 2,
//       stamina: 1,
//       defense: 0,
//       nft_address: "B9-lCfmpAqDLhcyLL054pEYzNZlV6ZyseBsuxx2C-IY",
//       id: "2",
//       total_stamina: 6,
//       gold_balance: 24070,
//       current_spot: 0,
//       address: "9T6eBRHUSaoS4Dxi0iVdyaSroL6EaxGGKlgxBvMr6go",
//       dumz_balance: 60,
//     },
//   },
//   players_alive: ["3"],
// } as any;
export default function Combat() {
  const { loading, enteringNewBattle, currentBattle, getOpenBattles, setCurrentBattle, enterNewBattle, userAttack, userRun } = useCombatStore();
  const { user, setGameStatePage, refreshUserData } = useGameStore();

  // console.log("currentBattle", currentBattle);

  //   Check for open battles
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;

    if (enteringNewBattle && !currentBattle?.id) {
      console.log("SET UP INTERVAL FOR CHECKING OPEN BATTLES");
      interval = setInterval(async () => {
        await Promise.all([getOpenBattles()]);
      }, 1000);

      // Stop checking after 60 seconds
      timeout = setTimeout(() => {
        if (interval) {
          console.log("Stopped checking for open battles after 60 seconds");
          clearInterval(interval);
        }
      }, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [enteringNewBattle, currentBattle, getOpenBattles]);

  //  Check for confirmation that user is in battle
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;

    if (!user?.current_battle_id) {
      console.log("SET UP INTERVAL FOR CHECKING USER IS IN BATTLE");
      interval = setInterval(async () => {
        await Promise.all([refreshUserData()]);
      }, 1000);
    }

    // Stop checking after 30 seconds
    timeout = setTimeout(() => {
      if (interval) {
        console.log("Stopped checking for user is in battle after 60 seconds");
        clearInterval(interval);
      }
    }, 30000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [user?.current_battle_id, setCurrentBattle]);

  // check for battle updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (currentBattle?.id && !currentBattle.ended) {
      if (interval) {
        clearInterval(interval);
      }
      interval = setInterval(() => {
        console.log("Checking for battle updates");
        setCurrentBattle(currentBattle.id);
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [currentBattle?.id, currentBattle?.ended, setCurrentBattle]);

  if (enteringNewBattle && !currentBattle?.id) {
    return <div>Entering a new battle...</div>;
  }

  if (currentBattle?.id && user?.current_battle_id !== currentBattle?.id) {
    return <div>Waiting for battle confirmation...</div>;
  }

  if (!currentBattle?.id) {
    return (
      <div>
        <p>No battle found</p>
        <div>
          <ImgButton src={"https://arweave.net/HyDiIRRNS5SdV3Q52RUNp-5YwKZjNwDIuOPLSUdvK7A"} onClick={() => setGameStatePage(GameStatePages.GAME_MAP)} alt={"Return to Town"} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 justify-between p-8 min-h-screen bg-gray-900">
      <audio src={SOUNDS.BATTLE_AUDIO} autoPlay loop />
      <BattleGround currentBattle={currentBattle} />
      <BattleLog currentBattle={currentBattle} />
    </div>
  );
}

function BattleGround({ currentBattle }: { currentBattle: Battle }) {
  const userId = useGameStore((state) => state.user!.id);
  const userAttack = useCombatStore((state) => state.userAttack);
  const userRun = useCombatStore((state) => state.userRun);
  const loading = useCombatStore((state) => state.loading);
  const disableAttackButtons =
    currentBattle.ended || // battle has ended
    !!currentBattle.players_attacked.find((player) => player === userId.toString()) || // user has attacked
    !currentBattle.players_alive.find((player) => player === userId.toString()); // user is not alive

  const attackAudioRef = useRef<HTMLAudioElement>(null);

  const handleAttack = (enemyId: string) => {
    if (attackAudioRef.current) {
      attackAudioRef.current.currentTime = 0; // Reset audio to start
      attackAudioRef.current.play();
    }
    userAttack(enemyId);
  };

  const otherPlayers = Object.values(currentBattle.players).filter((player) => player.id !== userId.toString());
  const enemies = Object.values(currentBattle.npcs);

  const allPlayers = [...enemies, ...otherPlayers];

  return (
    <div>
      <div className="flex gap-4 items-center">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <audio ref={attackAudioRef} src={SOUNDS.ATTACK_AUDIO} />
          <div className="flex flex-col gap-2 max-w-[380px] items-center">
            <PlayerCard player={currentBattle.players[userId.toString()]} />
            <ImgButton
              disabled={loading || disableAttackButtons}
              className={"w-40"}
              src={"https://arweave.net/T2vJXtx4ivM9tySkAq8u2uSCLSDWRaPcIqqBYdAWBfE"}
              onClick={() => userRun()}
              alt={"Run"}
            />
          </div>

          <div className="flex justify-center items-center">
            <img className="w-[98px] h-[101px]" src={"https://arweave.net/bXDhJ_4eLp_VCErak5teFjgMRkKV7LaCg5Dbs7xOE2I"} alt="Wand" />
          </div>

          {allPlayers.map((entity, index) => {
            const isEnemy = entity.id.startsWith("NPC");
            const enemyIsAlive = currentBattle.npcs_alive.includes(entity.id) || currentBattle.players_alive.includes(entity.id);
            return (
              <>
                <div key={entity.id} className="flex flex-col gap-2 max-w-[380px] items-center">
                  {isEnemy && (
                    <div className={`${enemyIsAlive ? "opacity-100" : "opacity-30"}`}>
                      <EnemyCard enemy={entity as NPC} />
                    </div>
                  )}

                  {!isEnemy && (
                    <div className={`${enemyIsAlive ? "opacity-100" : "opacity-30"}`}>
                      <PlayerCard player={entity as Battle["players"][string]} />
                    </div>
                  )}

                  {enemyIsAlive && (
                    <div className="flex gap-2 items-center">
                      <ImgButton
                        disabled={loading || disableAttackButtons}
                        className="w-40 shrink-0"
                        src={"https://arweave.net/DgrvBd4oLXyLXGxNlU3YRxDo1LBpTYKVc_T0irDrmj0"}
                        onClick={() => handleAttack(entity.id)}
                        alt={"Attack" + entity.name}
                      />

                      {isEnemy && <p className="text-white text-lg font-bold text-center">30 seconds till {entity.name} attacks...</p>}
                      {/* {!isEnemy && <p className="text-white text-lg font-bold text-center">{entity.name} has 30 seconds...</p>} */}
                    </div>
                  )}
                </div>

                {index % 2 !== 0 && index !== allPlayers.length - 1 && (
                  <div className="flex justify-center items-center">
                    <img className="w-[98px] h-[101px]" src={"https://arweave.net/bXDhJ_4eLp_VCErak5teFjgMRkKV7LaCg5Dbs7xOE2I"} alt="Wand" />
                  </div>
                )}
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ player }: { player: Battle["players"][string] }) {
  const user = useGameStore((state) => state.user);
  const totalHealth = player.total_health;
  const totalStamina = player.total_stamina;
  const filledHealth = player.health;
  const filledStamina = player.stamina;
  const drinkPotion = useCombatStore((state) => state.userDrinkPotion);
  const combatLoading = useCombatStore((state) => state.loading);

  const { weapon, armor } = getEquippedItem(user!);

  return (
    <div
      className="w-[250px] flex flex-col bg-[url('https://arweave.net/YHfNqgt4OHoiMxr3Jm9P4FB1QUCg7fND5IBkvuQm96c')] bg-no-repeat bg-contain bg-center px-4 py-1"
      style={{ aspectRatio: "302/421" }}
    >
      <h2 className="text-black text-2xl font-bold text-center">{player.name} (P)</h2>
      <img src={player.nft_address ? `https://arweave.net/${player.nft_address}` : IMAGES.DEFAULT_DUMDUM} alt={player.name} className="w-full  max-h-[250px] object-contain mb-2" />
      <div className="flex gap-2 justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            {Array.from({ length: totalHealth }).map((_, index) => (
              <img className="w-5" key={index} src={index < filledHealth ? IMAGES.FILLED_HEALTH : IMAGES.EMPTY_HEALTH} alt="Health" />
            ))}
          </div>
          {/* <div className="flex gap-1">
            {Array.from({ length: totalStamina }).map((_, index) => (
              <img className="w-5" key={index} src={index < filledStamina ? IMAGES.FILLED_STAMINA : IMAGES.EMPTY_STAMINA} alt="Stamina" />
            ))}
          </div> */}
          {player.potion && (
            <>
              <div className="flex gap-1">
                <img className="h-7" src={ITEM_ICONS[player.potion.item_id as keyof typeof ITEM_ICONS]} alt="Potion" />
                <p className="text-black text-2xl font-bold text-center">{player.potion_used ? 0 : player.potion.health}</p>
              </div>
              <div className="flex gap-1">
                {user?.id.toString() == player.id && (
                  <ImgButton
                    disabled={combatLoading || player.potion_used}
                    className="w-20 shrink-0"
                    src={"https://arweave.net/K815sdYLj_pFQQ_95fSY3P-55XinoUZiTskuJEgaK8w"}
                    onClick={() => drinkPotion()}
                    alt={"Use Potion"}
                  />
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-center justify-between">
            <img src={weapon ? ITEM_ICONS.WEAPON_1 : ITEM_ICONS.NO_WEAPON} alt="weapon in inventory" className="w-8 h-8" />
            <p className="text-black text-2xl font-bold text-center">{player.damage}</p>
          </div>
          <div className="flex flex-col gap-1 items-center justify-between">
            <img src={armor ? ITEM_ICONS.ARMOR_1 : ITEM_ICONS.NO_ARMOR} alt="armor in inventory" className="w-8 h-8" />
            <p className="text-black text-2xl font-bold text-center">{player.defense}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnemyCard({ enemy }: { enemy: Battle["npcs"][string] }) {
  const backgroundImage = ENEMY_CARD_IMAGE[enemy.id as keyof typeof ENEMY_CARD_IMAGE];
  const totalHealth = enemy.total_health;
  const filledHealth = enemy.health;
  return (
    <div
      className="w-[250px] flex flex-col bg-no-repeat bg-contain bg-center relative"
      style={{
        aspectRatio: "302/421",
        backgroundImage: `url('${backgroundImage}')`,
      }}
    >
      <div className="absolute bottom-[19%] left-0 right-0 w-full">
        <div className="flex gap-1 px-4 justify-start">
          {Array.from({ length: totalHealth }).map((_, index) => (
            <img key={index} src={index < filledHealth ? IMAGES.FILLED_HEALTH : IMAGES.EMPTY_HEALTH} alt="Health" className="w-[9%] " />
          ))}
        </div>
      </div>
      <div className="absolute bottom-[3%] left-[2%] w-[26%]">
        <p className="text-black text-xl font-bold text-right">{(enemy.extra_gold ?? 0) + enemy.gold_reward}g</p>
      </div>
    </div>
  );
}

function BattleLog({ currentBattle }: { currentBattle: Battle }) {
  const setGameStatePage = useGameStore((state) => state.setGameStatePage);
  const combatLoading = useCombatStore((state) => state.loading);
  const goToMapFromBattle = useCombatStore((state) => state.goToMapFromBattle);

  // as the log is updated, scroll to the bottom
  useEffect(() => {
    const logContainer = document.querySelector(".log-container");
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [currentBattle.log]);

  return (
    <div
      className="flex shrink-0 flex-col gap-2 bg-[url('https://arweave.net/V4B3MJpEEAStbIOJbygQ6-lcVBR8w_8baD5TKK7u6p8')] bg-no-repeat bg-contain bg-center p-4 min-w-[460px] max-w-[50vw] h-full"
      style={{ aspectRatio: "649/1040", maxHeight: "calc(100vh - 60px)" }}
    >
      <div className="flex items-center justify-between">
        <div className="w-6">{combatLoading && <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>}</div>
        <h1 className="text-white my-4 text-5xl font-bold text-center underline flex-grow">COMBAT LOG</h1>
        <div className="w-6"></div>
      </div>
      <div className="log-container flex flex-col gap-8 overflow-y-auto">
        {currentBattle.log.map((log, index) => {
          const name = currentBattle.players[log.from]?.name || currentBattle.npcs[log.from]?.name || "";
          return (
            <div key={index} className="flex text-2xl gap-4 justify-between px-4">
              <p className="text-white font-bold text-center">{name}:</p>
              <p className="text-white text-center">
                {log.message.split(" ").map((word, index) =>
                  word === "Perished" ? (
                    <span key={index} className="text-red-800">
                      {word}
                    </span>
                  ) : word === "run" && log.message.split(" ")[index + 1] === "away" ? (
                    <span key={index} className="text-blue-800">
                      {word} {log.message.split(" ")[index + 1]}
                    </span>
                  ) : word === "away" && log.message.split(" ")[index - 1] === "run" ? (
                    <></>
                  ) : (
                    <span key={index}>{word} </span>
                  )
                )}
              </p>
            </div>
          );
        })}
      </div>
      {currentBattle.ended && (
        <div className="my-4 flex justify-center">
          <ImgButton disabled={combatLoading} src={"https://arweave.net/-ewxfMOLuaFH6ODHxg8KgMWMKkZfAt-yhX1tv2O2t5Y"} onClick={() => goToMapFromBattle()} alt={"Return to Town"} />
        </div>
      )}
    </div>
  );
}
