#include "smart_contract.h"
#include <sstream>
#include <iostream>

namespace pqrdl {

SmartContract::SmartContract(const std::string& code, const std::string& owner)
    : code_(code), owner_(owner) {
    // Generate contract ID using post-quantum hash
    crypto::cn_fast_hash(code.data(), code.size(), contract_id_);
}

TokenContract::TokenContract(const std::string& name, const std::string& symbol,
                           uint64_t totalSupply, const std::string& owner)
    : SmartContract("", owner), name_(name), symbol_(symbol), total_supply_(totalSupply) {
    balances_[owner] = totalSupply;
}

bool TokenContract::execute(const std::vector<std::string>& inputs,
                           std::vector<std::string>& outputs) {
    if (inputs.empty()) return false;

    std::string action = inputs[0];

    if (action == "transfer" && inputs.size() >= 3) {
        std::string from = inputs[1];
        std::string to = inputs[2];
        uint64_t amount = std::stoull(inputs[3]);

        if (balances_[from] >= amount) {
            balances_[from] -= amount;
            balances_[to] += amount;
            outputs.push_back("success");
            return true;
        }
    } else if (action == "balance" && inputs.size() >= 2) {
        std::string account = inputs[1];
        outputs.push_back(std::to_string(balances_[account]));
        return true;
    }

    outputs.push_back("error");
    return false;
}

std::string TokenContract::getState() const {
    std::stringstream ss;
    ss << "Name: " << name_ << "\n";
    ss << "Symbol: " << symbol_ << "\n";
    ss << "Total Supply: " << total_supply_ << "\n";
    for (const auto& balance : balances_) {
        ss << "Balance " << balance.first << ": " << balance.second << "\n";
    }
    return ss.str();
}

bool TokenContract::updateState(const std::string& newState) {
    // Parse and update state
    return true;
}

GovernanceContract::GovernanceContract(const std::string& owner)
    : SmartContract("", owner) {}

bool GovernanceContract::execute(const std::vector<std::string>& inputs,
                                std::vector<std::string>& outputs) {
    if (inputs.empty()) return false;

    std::string action = inputs[0];

    if (action == "propose" && inputs.size() >= 2) {
        std::string proposal = inputs[1];
        return propose(proposal);
    } else if (action == "vote" && inputs.size() >= 3) {
        std::string voter = inputs[1];
        std::string proposalId = inputs[2];
        bool approve = inputs[3] == "true";
        return vote(voter, proposalId, approve);
    } else if (action == "execute" && inputs.size() >= 2) {
        std::string proposalId = inputs[1];
        return executeProposal(proposalId);
    }

    return false;
}

bool GovernanceContract::propose(const std::string& proposal) {
    std::string id = std::to_string(proposals_.size());
    proposals_[id] = {id, proposal, 0, 0, false};
    return true;
}

bool GovernanceContract::vote(const std::string& voter, const std::string& proposalId, bool approve) {
    if (proposals_.find(proposalId) == proposals_.end()) return false;
    if (votes_[proposalId].find(voter) != votes_[proposalId].end()) return false;

    votes_[proposalId][voter] = approve;
    if (approve) {
        proposals_[proposalId].votes_for++;
    } else {
        proposals_[proposalId].votes_against++;
    }
    return true;
}

bool GovernanceContract::executeProposal(const std::string& proposalId) {
    if (proposals_.find(proposalId) == proposals_.end()) return false;
    if (proposals_[proposalId].executed) return false;

    // Simple majority
    if (proposals_[proposalId].votes_for > proposals_[proposalId].votes_against) {
        proposals_[proposalId].executed = true;
        return true;
    }
    return false;
}

std::string GovernanceContract::getState() const {
    std::stringstream ss;
    for (const auto& prop : proposals_) {
        ss << "Proposal " << prop.first << ": " << prop.second.description
           << " (For: " << prop.second.votes_for << ", Against: " << prop.second.votes_against
           << ", Executed: " << (prop.second.executed ? "Yes" : "No") << ")\n";
    }
    return ss.str();
}

bool GovernanceContract::updateState(const std::string& newState) {
    return true;
}

SmartContractManager& SmartContractManager::getInstance() {
    static SmartContractManager instance;
    return instance;
}

crypto::hash SmartContractManager::deployContract(std::unique_ptr<SmartContract> contract) {
    crypto::hash id = contract->getContractId();
    contracts_[id] = std::move(contract);
    return id;
}

bool SmartContractManager::executeContract(const crypto::hash& contractId,
                                         const std::vector<std::string>& inputs,
                                         std::vector<std::string>& outputs) {
    auto it = contracts_.find(contractId);
    if (it == contracts_.end()) return false;

    return it->second->execute(inputs, outputs);
}

SmartContract* SmartContractManager::getContract(const crypto::hash& contractId) {
    auto it = contracts_.find(contractId);
    return it != contracts_.end() ? it->second.get() : nullptr;
}

} // namespace pqrdl