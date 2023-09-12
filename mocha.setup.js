import chai from 'chai';
import chaiSpies from 'chai-spies';
import chaiSubset from 'chai-subset';
import chaiAsPromised from 'chai-as-promised';

process.env['NODE_ENV'] = 'test';

chai.use(chaiSpies);
chai.use(chaiSubset);
chai.use(chaiAsPromised);
