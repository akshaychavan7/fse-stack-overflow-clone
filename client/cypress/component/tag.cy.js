import Tag from '../../src/components/Main/tagPage/tag/Tag';
import TagPage from '../../src/components/Main/tagPage/TagPage'
import TagChip from '../../src/components/Main/TagChip/TagChip'


describe("Tag component", () => {
    it('Rendering Tag Chip', () => {
        const tag = {tid : 1, name : 'Sample Tag', qcnt: 2}
        const clickTag = (name) => console.log('Clicked on clickTag '+name)
        
        cy.window().then((win) => {
            cy.spy(win.console, 'log').as('consoleLogSpy');
        });  
        
        cy.mount(<TagChip 
            tag={tag} 
            clickTag={clickTag}
            />)
        cy.get('.question_tag_button').contains(tag.name);
    })

    it('Rendering Tag', () => {
        const tag = {tid : 1, name : 'Sample Tag', qcnt: 2}
        const clickTag = (name) => console.log('Clicked on clickTag '+name)
        
        cy.window().then((win) => {
            cy.spy(win.console, 'log').as('consoleLogSpy');
        });  
        
        cy.mount(<Tag 
            t={tag} 
            clickTag={clickTag}
            />)
        cy.get('.MuiChip-root').contains(tag.name);
        cy.get('.MuiTypography-root').contains(`${tag.qcnt} questions`);
    })
});

describe("Tag Page component", () => {
    it('Rendering Tag Page Component', () => {
        const tag1 = {tid : 1, name : 'Sample Tag 1', qcnt: 2}
        const tag2 = {tid : 2, name : 'Sample Tag 2', qcnt: 4}
        const tlist = [tag1, tag2]
        const getTagsWithQuestionNumber = cy.stub().resolves(tlist);
        const clickTag = cy.stub();
        const handleNewQuestion = cy.stub();
        
        cy.mount(<TagPage 
            getTagsWithQuestionNumber={getTagsWithQuestionNumber}
            clickTag={clickTag}
            handleNewQuestion = {handleNewQuestion}/>);
        cy.get('.space_between > :nth-child(1)').contains("2 Tags");
        cy.get('.space_between > :nth-child(2)').contains("All Tags");
        cy.get(':nth-child(1) > .MuiPaper-root > .MuiChip-root > .MuiChip-label').contains(tag1.name);
        cy.get(':nth-child(1) > .MuiPaper-root > .MuiTypography-root').contains(`${tag1.qcnt} questions`);
        cy.get(':nth-child(2) > .MuiPaper-root > .MuiChip-root > .MuiChip-label').contains(tag2.name);
        cy.get(':nth-child(2) > .MuiPaper-root > .MuiTypography-root').contains(`${tag2.qcnt} questions`);
    })

    it('Rendering Search Tag Page Component', () => {
        const tag1 = {tid : 1, name : 'Sample Tag 1', qcnt: 2}
        const tag2 = {tid : 2, name : 'Sample Tag 2', qcnt: 4}
        const tlist = [tag1, tag2]
        const getTagsWithQuestionNumber = cy.stub().resolves(tlist);
        const clickTag = cy.stub();
        const handleNewQuestion = cy.stub();

        const search = tag1.name;
        
        cy.mount(<TagPage 
            getTagsWithQuestionNumber={getTagsWithQuestionNumber}
            clickTag={clickTag}
            handleNewQuestion = {handleNewQuestion}/>);
        cy.get('.space_between > :nth-child(1)').contains("2 Tags");
        cy.get('.space_between > :nth-child(2)').contains("All Tags");
        cy.get(':nth-child(1) > .MuiPaper-root > .MuiChip-root > .MuiChip-label').contains(tag1.name);
        cy.get(':nth-child(1) > .MuiPaper-root > .MuiTypography-root').contains(`${tag1.qcnt} questions`);
        cy.get(':nth-child(2) > .MuiPaper-root > .MuiChip-root > .MuiChip-label').contains(tag2.name);
        cy.get(':nth-child(2) > .MuiPaper-root > .MuiTypography-root').contains(`${tag2.qcnt} questions`);

        cy.get('.search-user').type(search);

        cy.get(':nth-child(1) > .MuiPaper-root > .MuiChip-root > .MuiChip-label').contains(tag1.name);
        cy.get(':nth-child(1) > .MuiPaper-root > .MuiTypography-root').contains(`${tag1.qcnt} questions`);
    })
});