#pragma once

#include <string>
#include <vector>
#include <memory>
#include <unordered_map>
#include <functional>
#include "crypto/crypto.h"

namespace pqrdl {

class AIAgent {
public:
    AIAgent(const std::string& name, const std::string& type);
    virtual ~AIAgent() = default;

    // Process input and generate response
    virtual std::string processInput(const std::string& input) = 0;

    // Learn from data
    virtual void learn(const std::vector<std::string>& data) = 0;

    // Get agent capabilities
    virtual std::vector<std::string> getCapabilities() const = 0;

    // Execute autonomous action
    virtual bool executeAction(const std::string& action) = 0;

    const std::string& getName() const { return name_; }
    const std::string& getType() const { return type_; }
    const crypto::hash& getAgentId() const { return agent_id_; }

protected:
    std::string name_;
    std::string type_;
    crypto::hash agent_id_;
    std::unordered_map<std::string, std::string> knowledge_base_;
};

class GovernanceAIAgent : public AIAgent {
public:
    GovernanceAIAgent();

    std::string processInput(const std::string& input) override;
    void learn(const std::vector<std::string>& data) override;
    std::vector<std::string> getCapabilities() const override;
    bool executeAction(const std::string& action) override;

private:
    std::vector<std::string> governance_patterns_;
    std::unordered_map<std::string, double> proposal_scores_;
};

class MarketAIAgent : public AIAgent {
public:
    MarketAIAgent();

    std::string processInput(const std::string& input) override;
    void learn(const std::vector<std::string>& data) override;
    std::vector<std::string> getCapabilities() const override;
    bool executeAction(const std::string& action) override;

private:
    std::vector<double> price_history_;
    std::unordered_map<std::string, double> market_indicators_;
};

class SecurityAIAgent : public AIAgent {
public:
    SecurityAIAgent();

    std::string processInput(const std::string& input) override;
    void learn(const std::vector<std::string>& data) override;
    std::vector<std::string> getCapabilities() const override;
    bool executeAction(const std::string& action) override;

private:
    std::vector<std::string> threat_patterns_;
    std::unordered_map<std::string, int> security_alerts_;
};

class AIAgentManager {
public:
    static AIAgentManager& getInstance();

    // Register a new AI agent
    void registerAgent(std::unique_ptr<AIAgent> agent);

    // Get agent by ID
    AIAgent* getAgent(const crypto::hash& agentId);

    // Process input through appropriate agent
    std::string processWithAgent(const crypto::hash& agentId, const std::string& input);

    // Get all registered agents
    std::vector<AIAgent*> getAllAgents();

    // Autonomous agent execution cycle
    void runAutonomousCycle();

private:
    AIAgentManager() = default;
    std::unordered_map<crypto::hash, std::unique_ptr<AIAgent>> agents_;
};

} // namespace pqrdl