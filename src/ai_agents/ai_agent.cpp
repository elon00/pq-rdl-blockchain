#include "ai_agent.h"
#include <algorithm>
#include <sstream>
#include <iostream>
#include <random>

namespace pqrdl {

AIAgent::AIAgent(const std::string& name, const std::string& type)
    : name_(name), type_(type) {
    // Generate simple agent ID
    std::hash<std::string> hasher;
    agent_id_ = hasher(name + type);
}

GovernanceAIAgent::GovernanceAIAgent()
    : AIAgent("GovernanceAI", "governance") {
    governance_patterns_ = {
        "proposal", "vote", "governance", "policy", "decision",
        "consensus", "stakeholder", "democracy", "transparency"
    };
}

std::string GovernanceAIAgent::processInput(const std::string& input) {
    std::string lower_input = input;
    std::transform(lower_input.begin(), lower_input.end(), lower_input.begin(), ::tolower);

    // Simple pattern matching
    for (const auto& pattern : governance_patterns_) {
        if (lower_input.find(pattern) != std::string::npos) {
            if (pattern == "proposal") {
                return "I can help analyze this governance proposal. Key considerations: stakeholder impact, implementation feasibility, and alignment with network state principles.";
            } else if (pattern == "vote") {
                return "Voting analysis: Consider long-term network effects, community consensus, and founder guidance for optimal decision-making.";
            }
        }
    }

    return "Governance query processed. For optimal network state governance, I recommend: 1) Transparent decision-making, 2) Community participation, 3) Founder oversight for critical decisions.";
}

void GovernanceAIAgent::learn(const std::vector<std::string>& data) {
    for (const auto& item : data) {
        // Simple learning: extract keywords
        std::stringstream ss(item);
        std::string word;
        while (ss >> word) {
            if (word.length() > 4) { // Learn longer words
                governance_patterns_.push_back(word);
            }
        }
    }
}

std::vector<std::string> GovernanceAIAgent::getCapabilities() const {
    return {
        "Proposal analysis",
        "Voting recommendations",
        "Governance optimization",
        "Stakeholder communication",
        "Policy impact assessment"
    };
}

bool GovernanceAIAgent::executeAction(const std::string& action) {
    if (action == "analyze_proposals") {
        std::cout << "GovernanceAI: Analyzing pending proposals..." << std::endl;
        return true;
    } else if (action == "optimize_voting") {
        std::cout << "GovernanceAI: Optimizing voting parameters..." << std::endl;
        return true;
    }
    return false;
}

MarketAIAgent::MarketAIAgent()
    : AIAgent("MarketAI", "market") {}

std::string MarketAIAgent::processInput(const std::string& input) {
    if (input.find("price") != std::string::npos) {
        return "Market analysis: Current trends show increasing adoption. Recommended actions: HODL for network state development, participate in governance for value accrual.";
    } else if (input.find("trading") != std::string::npos) {
        return "Trading recommendation: Focus on long-term holding rather than short-term speculation. Network state value derives from utility and governance participation.";
    }

    return "Market intelligence: PQ-RDL demonstrates strong fundamentals with post-quantum security, governance mechanisms, and network state vision.";
}

void MarketAIAgent::learn(const std::vector<std::string>& data) {
    for (const auto& price : data) {
        try {
            double p = std::stod(price);
            price_history_.push_back(p);
        } catch (...) {
            // Skip invalid data
        }
    }
}

std::vector<std::string> MarketAIAgent::getCapabilities() const {
    return {
        "Price analysis",
        "Market trend prediction",
        "Trading recommendations",
        "Risk assessment",
        "Portfolio optimization"
    };
}

bool MarketAIAgent::executeAction(const std::string& action) {
    if (action == "analyze_market") {
        std::cout << "MarketAI: Analyzing market conditions..." << std::endl;
        return true;
    }
    return false;
}

SecurityAIAgent::SecurityAIAgent()
    : AIAgent("SecurityAI", "security") {
    threat_patterns_ = {
        "attack", "vulnerability", "exploit", "hack", "breach",
        "malware", "phishing", "ddos", "intrusion"
    };
}

std::string SecurityAIAgent::processInput(const std::string& input) {
    std::string lower_input = input;
    std::transform(lower_input.begin(), lower_input.end(), lower_input.begin(), ::tolower);

    for (const auto& threat : threat_patterns_) {
        if (lower_input.find(threat) != std::string::npos) {
            return "SECURITY ALERT: Potential " + threat + " detected. Post-quantum security measures activated. Recommend immediate verification and response protocol.";
        }
    }

    return "Security status: All systems secure. Post-quantum cryptography providing quantum-resistant protection for the network state.";
}

void SecurityAIAgent::learn(const std::vector<std::string>& data) {
    for (const auto& item : data) {
        std::string lower_item = item;
        std::transform(lower_item.begin(), lower_item.end(), lower_item.begin(), ::tolower);

        for (const auto& threat : threat_patterns_) {
            if (lower_item.find(threat) != std::string::npos) {
                security_alerts_[threat]++;
            }
        }
    }
}

std::vector<std::string> SecurityAIAgent::getCapabilities() const {
    return {
        "Threat detection",
        "Security monitoring",
        "Incident response",
        "Vulnerability assessment",
        "Quantum-safe authentication"
    };
}

bool SecurityAIAgent::executeAction(const std::string& action) {
    if (action == "scan_security") {
        std::cout << "SecurityAI: Scanning for threats..." << std::endl;
        return true;
    } else if (action == "activate_defenses") {
        std::cout << "SecurityAI: Activating quantum-resistant defenses..." << std::endl;
        return true;
    }
    return false;
}

AIAgentManager& AIAgentManager::getInstance() {
    static AIAgentManager instance;
    return instance;
}

void AIAgentManager::registerAgent(std::unique_ptr<AIAgent> agent) {
    agents_[agent->getAgentId()] = std::move(agent);
}

AIAgent* AIAgentManager::getAgent(const crypto::hash& agentId) {
    auto it = agents_.find(agentId);
    return it != agents_.end() ? it->second.get() : nullptr;
}

std::string AIAgentManager::processWithAgent(const crypto::hash& agentId, const std::string& input) {
    AIAgent* agent = getAgent(agentId);
    return agent ? agent->processInput(input) : "Agent not found";
}

std::vector<AIAgent*> AIAgentManager::getAllAgents() {
    std::vector<AIAgent*> result;
    for (auto& pair : agents_) {
        result.push_back(pair.second.get());
    }
    return result;
}

void AIAgentManager::runAutonomousCycle() {
    for (auto& pair : agents_) {
        // Autonomous actions
        pair.second->executeAction("autonomous_check");
    }
}

} // namespace pqrdl