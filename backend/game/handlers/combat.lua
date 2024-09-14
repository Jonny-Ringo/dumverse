local helpers = require("helpers")
local json = require("json")

Handlers.add("Combat.EnterNewCombat",
    Handlers.utils.hasMatchingTag('Action', 'Combat.EnterNewCombat'),
    function(msg)
        local user_id = msg.UserId
        local combat_level = tonumber(msg.Level)
        assert(combat_level, "Level is required")
        local userData = helpers.CheckUserExists(user_id, msg.From)
        local current_spot = userData.current_spot

        assert(userData.health > 0, "User must have health")
        assert(userData.stamina > 0, "User must have stamina")

        -- if the current spot has to be +1 or -1 from the combat_level
        assert(combat_level, "Combat Level is required")
        assert(combat_level > 0, "Combat Level must be greater than 0")
        assert(combat_level < 10, "Combat Level must be less than 10")
        if current_spot < combat_level then
            assert(combat_level - current_spot == 1, "Current spot must be only 1 less than combat level")
            current_spot = current_spot + 1
        elseif current_spot > combat_level then
            assert(current_spot - combat_level == 1, "Current spot must be only 1 more than combat level")
            current_spot = current_spot - 1
        end

        -- get equipped inventory items - for potions
        -- local equippedItems = dbAdmin:exec(string.format([[
        --     SELECT * FROM Inventory WHERE USER_ID = %f AND EQUIPPED = TRUE;
        -- ]], user_id))

        -- TODO: based on combat_level, get the enemies from the ENEMIES table
        local enemies = {}

        ao.send({
            Target = COMBAT_PROCESS_ID,
            Action = "Battle.NewUserJoin",
            UserId = tostring(user_id),
            Level = tostring(combat_level),
            Status = "Success",
            Data = json.encode({
                npcs = json.encode({ ENEMIES[1], ENEMIES[2] }),
                player = json.encode(userData),
            }),
        })
    end
)

Handlers.add("Combat.EnteredNewCombat",
    Handlers.utils.hasMatchingTag('Action', 'Combat.EnteredNewCombat'),
    function(msg)
        assert(msg.From == COMBAT_PROCESS_ID, "Only Combat process can send this message")
        local user_id = msg.UserId
        local battle_id = tonumber(msg.BattleId)
        local level = tonumber(msg.Level)
        assert(battle_id, "BattleId is required")
        assert(level, "Level is required")

        -- update Users table with battle_id
        dbAdmin:exec(string.format([[
            UPDATE Users SET current_battle_id = %d, current_spot = %d WHERE id = %f;
        ]], battle_id, level, user_id))
    end
)

Handlers.add("Combat.PlayerWon",
    Handlers.utils.hasMatchingTag('Action', 'Combat.PlayerWon'),
    function(msg)
        assert(msg.From == COMBAT_PROCESS_ID, "Only Combat process can send this message")
        local user_id = msg.UserId
        local playerData = json.decode(msg.Data)
        local stamina = playerData.stamina - 1 -- subtract 1 from stamina from battling

        -- update Users table with health, stamina, gold_balance, dumz_balance
        dbAdmin:exec(string.format([[
            UPDATE Users SET current_battle_id = NULL, health = %f, stamina = %f, gold_balance = %f, dumz_balance = %f WHERE id = %f;
        ]], playerData.health, stamina, playerData.gold_balance, playerData.dumz_balance, user_id))
    end
)

Handlers.add("Combat.PlayerRanAway",
    Handlers.utils.hasMatchingTag('Action', 'Combat.PlayerRanAway'),
    function(msg)
        assert(msg.From == COMBAT_PROCESS_ID, "Only Combat process can send this message")
        local user_id = msg.UserId
        local playerData = json.decode(msg.Data)
        local stamina = playerData.stamina - 1 -- subtract 1 from stamina from battling

        -- update Users table with health, stamina, gold_balance, dumz_balance
        dbAdmin:exec(string.format([[
            UPDATE Users SET current_battle_id = NULL, health = %f, stamina = %f, gold_balance = %f, dumz_balance = %f WHERE id = %f;
        ]], playerData.health, stamina, playerData.gold_balance, playerData.dumz_balance, user_id))
    end
)

Handlers.add("Combat.PlayerPerished",
    Handlers.utils.hasMatchingTag('Action', 'Combat.PlayerPerished'),
    function(msg)
        assert(msg.From == COMBAT_PROCESS_ID, "Only Combat process can send this message")
        local user_id = msg.UserId

        -- update Users table
        dbAdmin:exec(string.format([[
            UPDATE Users SET current_battle_id = NULL, current_spot = 0, health = 0, gold_balance = 0, dumz_balance = 0, stamina = 0 WHERE id = %f;
        ]], user_id))
    end
)

return {}
