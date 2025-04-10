// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleScholarDAO {
    // DAO Members
    mapping(address => bool) public members;
    mapping(uint256 => address) private memberByIndex;
    address public admin;
    uint256 public totalMembers = 1; // Track total members (starting with admin)
    
    // Staking configuration
    uint256 public stakingAmount = 0.00005 ether; // Fixed staking amount
    mapping(uint256 => uint256) public paperStakes; // Track stake amounts by paper ID
    mapping(uint256 => bool) public stakeReturned; // Track if stake was already returned
    
    // Voting configuration
    uint256 public minRequiredVotes = 3; // Minimum votes required before verification
    
    // Paper struct
    struct Paper {
        address author;
        string title;
        string contentHash;
        uint256 accessPrice;
        bool decided;       
        bool approved;      
        uint8 approvalCount;
        uint8 rejectionCount;
        string teamMembers;     // Field for co-authors
        string researchField;   // Field for academic discipline
        bool isRevision;        // Whether this is a revision of a rejected paper
        uint256 previousVersion; // ID of the previous version (if revision)
        mapping(address => bool) hasVoted;
        mapping(address => string) voterComments; // Store comments from each voter
    }
    
    // Paper storage
    mapping(uint256 => Paper) public papers;
    uint256 public paperCount;
    
    // Events
    event MemberAdded(address member);
    event PaperSubmitted(uint256 paperId, address author, string researchField);
    event VerificationVote(uint256 paperId, address member, bool approved);
    event VoterComment(uint256 paperId, address voter, string comment);
    event PaperVerified(uint256 paperId, bool approved);
    event AccessPurchased(uint256 paperId, address buyer);
    event StakeReturned(uint256 paperId, address author, uint256 amount);
    event StakingAmountChanged(uint256 oldAmount, uint256 newAmount);
    event MinRequiredVotesChanged(uint256 oldMinVotes, uint256 newMinVotes);
    event PaperResubmitted(uint256 oldPaperId, uint256 newPaperId);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }
    
    modifier onlyMember() {
        require(members[msg.sender], "Not a member");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        members[msg.sender] = true; // Admin is first member
        memberByIndex[0] = msg.sender;
    }
    
    // Add a new DAO member
    function addMember(address _member) external onlyAdmin {
        require(!members[_member], "Already a member");
        members[_member] = true;
        memberByIndex[totalMembers] = _member;
        totalMembers++;
        emit MemberAdded(_member);
    }
    
    // Set staking amount (admin only)
    function setStakingAmount(uint256 _newAmount) external onlyAdmin {
        uint256 oldAmount = stakingAmount;
        stakingAmount = _newAmount;
        emit StakingAmountChanged(oldAmount, _newAmount);
    }
    
    // Set minimum required votes (admin only)
    function setMinRequiredVotes(uint256 _newMinVotes) external onlyAdmin {
        require(_newMinVotes > 0, "Min votes must be greater than 0");
        uint256 oldMinVotes = minRequiredVotes;
        minRequiredVotes = _newMinVotes;
        emit MinRequiredVotesChanged(oldMinVotes, _newMinVotes);
    }
    
    // Submit a paper for verification with staking requirement
    function submitPaper(
        string calldata _title, 
        string calldata _contentHash, 
        uint256 _price,
        string calldata _teamMembers,
        string calldata _researchField
    ) external payable {
        require(msg.value >= stakingAmount, "Must stake required amount");
        
        uint256 newPaperId = paperCount;
        
        Paper storage newPaper = papers[newPaperId];
        newPaper.author = msg.sender;
        newPaper.title = _title;
        newPaper.contentHash = _contentHash;
        newPaper.accessPrice = _price;
        newPaper.decided = false;
        newPaper.approved = false;
        newPaper.teamMembers = _teamMembers;
        newPaper.researchField = _researchField;
        newPaper.isRevision = false;
        newPaper.previousVersion = 0;
        
        // Store the stake amount
        paperStakes[newPaperId] = msg.value;
        stakeReturned[newPaperId] = false;
        
        emit PaperSubmitted(newPaperId, msg.sender, _researchField);
        paperCount++;
    }
    
    // Resubmit a rejected paper without requiring a new stake
    function resubmitPaper(
        uint256 _rejectedPaperId,
        string calldata _title, 
        string calldata _contentHash, 
        uint256 _price,
        string calldata _teamMembers,
        string calldata _researchField
    ) external returns (uint256 newPaperId) {
        Paper storage oldPaper = papers[_rejectedPaperId];
        
        // Validation
        require(oldPaper.author == msg.sender, "Only original author can resubmit");
        require(oldPaper.decided == true, "Paper not decided yet");
        require(oldPaper.approved == false, "Paper was already approved");
        require(!stakeReturned[_rejectedPaperId], "Stake already returned or paper already resubmitted");
        
        // Create a new paper entry
        newPaperId = paperCount;
        
        Paper storage newPaper = papers[newPaperId];
        newPaper.author = msg.sender;
        newPaper.title = _title;
        newPaper.contentHash = _contentHash;
        newPaper.accessPrice = _price;
        newPaper.decided = false;
        newPaper.approved = false;
        newPaper.teamMembers = _teamMembers;
        newPaper.researchField = _researchField;
        newPaper.isRevision = true;
        newPaper.previousVersion = _rejectedPaperId;
        
        // Transfer the stake from the old paper to the new one
        paperStakes[newPaperId] = paperStakes[_rejectedPaperId];
        paperStakes[_rejectedPaperId] = 0;
        stakeReturned[_rejectedPaperId] = true; // Mark as "returned" to prevent double use
        stakeReturned[newPaperId] = false;
        
        emit PaperResubmitted(_rejectedPaperId, newPaperId);
        paperCount++;
        
        return newPaperId;
    }
    
    // Vote on paper verification with comments
    function voteOnPaper(uint256 _paperId, bool _approve, string calldata _comment) external onlyMember {
        Paper storage paper = papers[_paperId];
        
        require(!paper.decided, "Paper already decided");
        require(!paper.hasVoted[msg.sender], "Already voted");
        require(paper.author != msg.sender, "Cannot vote on own paper");
        
        paper.hasVoted[msg.sender] = true;
        paper.voterComments[msg.sender] = _comment;
        
        if (_approve) {
            paper.approvalCount++;
        } else {
            paper.rejectionCount++;
        }
        
        emit VerificationVote(_paperId, msg.sender, _approve);
        emit VoterComment(_paperId, msg.sender, _comment);
        
        // Get total votes cast
        uint256 totalVotesCast = paper.approvalCount + paper.rejectionCount;
        
        // Only check for verification if minimum vote count is reached
        if (totalVotesCast >= minRequiredVotes) {
            // Check if verification threshold reached (80% of total members)
            if (paper.approvalCount >= (totalMembers * 80) / 100) {
                paper.decided = true;
                paper.approved = true;
                emit PaperVerified(_paperId, true);
            } else if (paper.rejectionCount > (totalMembers * 20) / 100) {
                // Paper rejected if more than 20% reject (meaning it can't reach 80% approval)
                paper.decided = true;
                paper.approved = false;
                emit PaperVerified(_paperId, false);
            }
        }
    }
    
    // Claim staking amount for approved papers
    function claimStake(uint256 _paperId) external {
        Paper storage paper = papers[_paperId];
        
        require(paper.author == msg.sender, "Only author can claim stake");
        require(paper.decided == true, "Paper verification not complete");
        require(paper.approved == true, "Paper was rejected");
        require(!stakeReturned[_paperId], "Stake already returned");
        
        stakeReturned[_paperId] = true;
        payable(msg.sender).transfer(paperStakes[_paperId]);
        
        emit StakeReturned(_paperId, msg.sender, paperStakes[_paperId]);
    }
    
    // Purchase access to a paper
    function purchaseAccess(uint256 _paperId) external payable {
        Paper storage paper = papers[_paperId];
        
        require(paper.decided, "Paper not decided");
        require(paper.approved, "Paper was rejected");
        require(msg.value >= paper.accessPrice, "Insufficient payment");
        
        // Send payment to paper author
        payable(paper.author).transfer(msg.value);
        
        emit AccessPurchased(_paperId, msg.sender);
    }
    
    // Get paper verification status
    function getPaperStatus(uint256 _paperId) external view returns (
        bool isDecided,
        bool isApproved,
        uint8 approvals,
        uint8 rejections
    ) {
        Paper storage paper = papers[_paperId];
        return (paper.decided, paper.approved, paper.approvalCount, paper.rejectionCount);
    }
    
    // Get paper details including new fields
    function getPaperDetails(uint256 _paperId) external view returns (
        address author,
        string memory title,
        uint256 price,
        string memory teamMembers,
        string memory researchField,
        bool isApproved,
        bool isRevision,
        uint256 previousVersion
    ) {
        Paper storage paper = papers[_paperId];
        return (
            paper.author,
            paper.title,
            paper.accessPrice,
            paper.teamMembers,
            paper.researchField,
            paper.approved,
            paper.isRevision,
            paper.previousVersion
        );
    }
    
    // Get comments from a specific voter for a paper
    function getPaperComment(uint256 _paperId, address _voter) external view returns (string memory) {
        return papers[_paperId].voterComments[_voter];
    }
    
    // Get member address by index
    function getMemberByIndex(uint256 _index) public view returns (address) {
        require(_index < totalMembers, "Index out of bounds");
        return memberByIndex[_index];
    }
    
    // Get all voters for a paper
    function getPaperVoters(uint256 _paperId) external view returns (address[] memory) {
        Paper storage paper = papers[_paperId];
        
        // First count how many voters we have
        uint count = 0;
        for (uint i = 0; i < totalMembers; i++) {
            address memberAddr = getMemberByIndex(i);
            if (paper.hasVoted[memberAddr]) {
                count++;
            }
        }
        
        // Then create and populate the array
        address[] memory voters = new address[](count);
        uint index = 0;
        for (uint i = 0; i < totalMembers; i++) {
            address memberAddr = getMemberByIndex(i);
            if (paper.hasVoted[memberAddr]) {
                voters[index] = memberAddr;
                index++;
            }
        }
        
        return voters;
    }
    
    // Helper to find the latest revision of a paper
    function getLatestRevision(uint256 _paperId) public view returns (uint256) {
        // Start with the given paper ID
        uint256 latestId = _paperId;
        
        // Check if there's a more recent revision
        for (uint256 i = 0; i < paperCount; i++) {
            if (papers[i].isRevision && papers[i].previousVersion == latestId) {
                latestId = i;
                // Start over to check for even newer revisions
                i = 0;
            }
        }
        
        return latestId;
    }
    
    // Get revision history of a paper
   // Fix the unused variable warning in getPaperRevisionHistory function
function getPaperRevisionHistory(uint256 _paperId) external view returns (uint256[] memory) {
    // Remove this unused variable
    // Paper storage paper = papers[_paperId];
    
    // Count how many previous versions exist
    uint256 count = 0;
    uint256 currentId = _paperId;
    
    while (papers[currentId].isRevision) {
        count++;
        currentId = papers[currentId].previousVersion;
    }
    
    // Create and populate the array in reverse order (oldest first)
    uint256[] memory history = new uint256[](count + 1);
    
    currentId = _paperId;
    for (uint256 i = count; i > 0; i--) {
        history[i] = currentId;
        currentId = papers[currentId].previousVersion;
    }
    history[0] = currentId; // Add the original paper
        
    return history;
}
}