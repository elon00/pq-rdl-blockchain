#pragma once

#include <string>
#include <vector>
#include <memory>
#include <unordered_map>
#include "crypto/crypto.h"

namespace pqrdl {

class SmartContract {
public:
    SmartContract(const std::string& code, const std::string& owner);
    virtual ~SmartContract() = default;

    // Execute contract with given inputs
    virtual bool execute(const std::vector<std::string>& inputs,
                        std::vector<std::string>& outputs) = 0;

    // Get contract state
    virtual std::string getState() const = 0;

    // Update contract state
    virtual bool updateState(const std::string& newState) = 0;

    const std::string& getOwner() const { return owner_; }
    const std::string& getCode() const { return code_; }
    const crypto::hash& getContractId() const { return contract_id_; }

protected:
    std::string code_;
    std::string owner_;
    crypto::hash contract_id_;
    std::unordered_map<std::string, std::string> state_;
};

class TokenContract : public SmartContract {
public:
    TokenContract(const std::string& name, const std::string& symbol,
                 uint64_t totalSupply, const std::string& owner);

    bool execute(const std::vector<std::string>& inputs,
                std::vector<std::string>& outputs) override;

    std::string getState() const override;
    bool updateState(const std::string& newState) override;

private:
    std::string name_;
    std::string symbol_;
    uint64_t total_supply_;
    std::unordered_map<std::string, uint64_t> balances_;
};

class GovernanceContract : public SmartContract {
public:
    GovernanceContract(const std::string& owner);

    bool execute(const std::vector<std::string>& inputs,
                std::vector<std::string>& outputs) override;

    std::string getState() const override;
    bool updateState(const std::string& newState) override;

    // Governance specific functions
    bool propose(const std::string& proposal);
    bool vote(const std::string& voter, const std::string& proposalId, bool approve);
    bool executeProposal(const std::string& proposalId);

private:
    struct Proposal {
        std::string id;
        std::string description;
        uint64_t votes_for;
        uint64_t votes_against;
        bool executed;
    };

    std::unordered_map<std::string, Proposal> proposals_;
    std::unordered_map<std::string, std::unordered_map<std::string, bool>> votes_;
};

class SmartContractManager {
public:
    static SmartContractManager& getInstance();

    // Deploy a new smart contract
    crypto::hash deployContract(std::unique_ptr<SmartContract> contract);

    // Execute a smart contract
    bool executeContract(const crypto::hash& contractId,
                        const std::vector<std::string>& inputs,
                        std::vector<std::string>& outputs);

    // Get contract by ID
    SmartContract* getContract(const crypto::hash& contractId);

private:
    SmartContractManager() = default;
    std::unordered_map<crypto::hash, std::unique_ptr<SmartContract>> contracts_;
};

} // namespace pqrdl